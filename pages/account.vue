<script setup lang="ts">
import { BookCoverImage } from '#components'
import { LogOut } from '@lucide/vue'
import { getCoverUrl } from '~/data/books'
import { useCatalog } from '~/composables/useCatalog'
import { useLibrary } from '~/composables/useLibrary'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { user, isAdmin, logout } = useAuth()
const { hasPendingRequest, isConfigured, isOwnerDevice, claim } = useAdminAccess()
const { getById, updateBook } = useCatalog()
const { state, returnBook } = useLibrary()
const { requests, updateStatus } = useRequests()
const { push: toast } = useToast()

if (import.meta.client && !user.value) {
  router.push({ path: '/login', query: { redirect: '/account' } })
} else if (import.meta.client && (user.value?.role === 'admin' || user.value?.role === 'super-admin')) {
  router.replace('/admin')
}

const savedBooks = computed(() => state.value.saved.map((id) => getById(id)).filter(Boolean))
const userBorrowRequests = computed(() => requests.value.filter((request) => request.userEmail === user.value?.email && request.kind === 'borrow'))
const approvedBorrowRequests = computed(() => userBorrowRequests.value.filter((request) => request.status === 'approved'))
const borrowedBooks = computed(() => approvedBorrowRequests.value.map((request) => ({ bookId: request.bookId, borrowedOn: request.processedOn || request.requestedOn, dueOn: new Date(new Date(request.processedOn || request.requestedOn).getTime() + 14 * 86400000).toISOString().slice(0, 10), requestId: request.id, book: getById(request.bookId) })).filter((r) => r.book))

function daysLeft(dueOn: string) {
  const diff = Math.ceil((new Date(dueOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}

async function onReturn(id: number) {
  const request = approvedBorrowRequests.value.find((item) => item.bookId === id)
  if (request) {
    await updateStatus(request.id, 'returned')
    const book = getById(id)
    if (book) await updateBook(id, { availability: { ...book.availability, checkedOut: Math.max(0, book.availability.checkedOut - 1) } })
    toast('Return recorded. Thanks!')
    return
  }
  returnBook(id)
  toast('Returned. Thanks!')
}

function onLogout() {
  logout()
  toast('Signed out.')
  router.push('/')
}

const claimBusy = ref(false)

async function onClaim() {
  claimBusy.value = true
  try {
    await claim(user.value?.email || '')
    toast('This account is now the library owner.')
    router.replace('/admin')
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not claim ownership.', 'error')
  } finally {
    claimBusy.value = false
  }
}
</script>

<template>
  <div v-if="user" class="page-shell max-w-5xl">
    <header class="flex items-center justify-between mb-8 flex-wrap gap-3">
      <div>
        <p class="page-eyebrow">Your account</p>
        <h1 class="page-title text-[clamp(2rem,4vw,2.75rem)]">Welcome back, {{ user.name }}.</h1>
      </div>
      <button
        type="button"
        class="rounded-card border border-line text-ink text-sm font-semibold px-5 py-2.5 hover:border-ink transition"
        @click="onLogout"
      >
        <LogOut class="mr-1.5 inline h-4 w-4 align-[-3px]" aria-hidden="true" />
        Sign out
      </button>
    </header>

    <section class="surface-card mb-6 flex items-center gap-4 p-5">
      <ProfileAvatar
        :name="user.name"
        :avatar="user.avatar"
        class="h-14 w-14 shrink-0 border-2 border-white font-display text-lg font-semibold shadow-card"
        :class="isAdmin ? 'bg-amber text-ink' : 'bg-ink text-white'"
      />
      <div>
        <p class="text-sm font-semibold">{{ user.name }}</p>
        <p class="text-[13.5px] text-ink-soft">{{ user.email }}</p>
      </div>
      <span
        class="ml-auto font-mono text-[11px] uppercase tracking-wide bg-parchment-dim border border-line px-2.5 py-1 rounded-full text-ink-soft"
      >
        {{ isAdmin ? 'Admin' : 'Free member' }}
      </span>
    </section>

    <section v-if="!isAdmin && !isConfigured && !isOwnerDevice" class="surface-card mb-6 p-5 bg-amber/5 border-amber/40">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p class="text-sm font-semibold">Become the library owner</p>
          <p class="text-[13.5px] text-ink-soft">No owner is set yet. Claim this account as the sole admin. You can then approve other admin requests.</p>
        </div>
        <button
          type="button"
          class="rounded-card bg-amber-deep text-white text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition"
          :disabled="claimBusy"
          @click="onClaim"
        >
          {{ claimBusy ? 'Claiming…' : 'Claim ownership' }}
        </button>
      </div>
    </section>

    <section v-else-if="hasPendingRequest" class="surface-card mb-6 p-5">
      <p class="text-sm font-semibold">Admin request pending</p>
      <p class="text-[13.5px] text-ink-soft">Your request is awaiting the owner's approval.</p>
    </section>

    <section class="grid grid-cols-2 gap-3 mb-10">
      <div class="surface-card p-4 text-center">
        <p class="font-display font-semibold text-xl">{{ savedBooks.length }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Saved</p>
      </div>
      <div class="surface-card p-4 text-center">
        <p class="font-display font-semibold text-xl">{{ borrowedBooks.length }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Borrowed</p>
      </div>
    </section>

    <!-- Borrowed -->
    <section class="mb-10">
      <h2 class="text-xl font-semibold mb-4">Currently borrowed</h2>
      <div v-if="borrowedBooks.length" class="flex flex-col gap-2.5">
        <div
          v-for="r in borrowedBooks"
          :key="r.bookId"
          class="flex items-center gap-3.5 bg-white border border-line rounded-card p-3"
        >
          <NuxtLink
            :to="`/products/${r.book!.id}`"
            class="h-14 w-10 shrink-0 overflow-hidden rounded border border-line bg-parchment-dim"
          ><BookCoverImage :src="r.book!.coverUrl" :fallback="getCoverUrl(r.book!.category)" :alt="r.book!.title" :label="r.book!.title" class="h-full w-full" /></NuxtLink>
          <NuxtLink :to="`/products/${r.book!.id}`" class="flex-1">
            <p class="text-sm font-semibold">{{ r.book!.title }}</p>
            <p class="text-xs" :class="daysLeft(r.dueOn) <= 3 ? 'text-rose' : 'text-ink-soft'">
              Due {{ r.dueOn }} ({{ daysLeft(r.dueOn) }} days left)
            </p>
          </NuxtLink>
          <NuxtLink
            :to="`/products/${r.book!.id}/read`"
            class="text-xs font-semibold text-amber-deep hover:underline"
            >Read</NuxtLink
          >
          <button
            class="text-xs text-ink-soft border border-line rounded-card px-3 py-1.5 hover:border-ink hover:text-ink transition"
            type="button"
            @click="onReturn(r.bookId)"
          >
            Return
          </button>
        </div>
      </div>
      <p v-else class="text-ink-soft text-[14.5px]">Nothing borrowed right now.</p>
    </section>

    <!-- Saved -->
    <section>
      <div class="flex items-baseline justify-between mb-4">
        <h2 class="text-xl font-semibold">Saved books</h2>
        <p class="font-mono text-xs text-ink-soft">{{ savedBooks.length }} saved</p>
      </div>
      <div v-if="savedBooks.length" class="flex flex-col gap-2.5">
        <div
          v-for="book in savedBooks"
          :key="book!.id"
          class="flex items-center gap-3.5 bg-white border border-line rounded-card p-3"
        >
          <NuxtLink
            :to="`/products/${book!.id}`"
            class="h-14 w-10 shrink-0 overflow-hidden rounded border border-line bg-parchment-dim"
          ><BookCoverImage :src="book!.coverUrl" :fallback="getCoverUrl(book!.category)" :alt="book!.title" :label="book!.title" class="h-full w-full" /></NuxtLink>
          <NuxtLink :to="`/products/${book!.id}`" class="flex-1">
            <p class="text-sm font-semibold">{{ book!.title }}</p>
            <p class="text-xs text-ink-soft">{{ book!.author }} &middot; {{ book!.format }}</p>
          </NuxtLink>
          <StarRating :rating="book!.rating" :size="10" />
        </div>
      </div>
      <p v-else class="text-ink-soft text-[14.5px]">
        Nothing saved yet. Browse the
        <NuxtLink to="/products" class="text-amber-deep underline">catalog</NuxtLink> and save a few
        titles.
      </p>
    </section>
  </div>
</template>
