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
  <div v-if="user" class="page-shell max-w-6xl rounded-[30px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-5 shadow-[0_18px_45px_rgba(16,85,65,0.08)] sm:p-8">
    <header class="flex items-center justify-between mb-8 flex-wrap gap-3">
      <div>
        <p class="page-eyebrow text-emerald-700">Your account</p>
        <h1 class="page-title mt-2 text-[clamp(2rem,4vw,2.8rem)] leading-none text-emerald-900">Welcome back, {{ user.name }}.</h1>
      </div>
      <button
        type="button"
        class="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50"
        @click="onLogout"
      >
        <LogOut class="mr-1.5 inline h-4 w-4 align-[-3px]" aria-hidden="true" />
        Sign out
      </button>
    </header>

    <section class="mb-8 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-200 bg-white/90 p-5 shadow-sm">
      <ProfileAvatar
        :name="user.name"
        :avatar="user.avatar"
        class="h-16 w-16 shrink-0 border-2 border-white font-display text-lg font-semibold shadow-card"
        :class="isAdmin ? 'bg-amber text-ink' : 'bg-emerald-700 text-white'"
      />
      <div class="min-w-0 flex-1">
        <p class="text-lg font-semibold text-emerald-900">{{ user.name }}</p>
        <p class="text-[13.5px] text-emerald-700/80">{{ user.email }}</p>
      </div>
      <span
        class="ml-auto rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-emerald-800"
      >
        {{ isAdmin ? 'Admin' : 'Free member' }}
      </span>
    </section>

    <section v-if="!isAdmin && !isConfigured && !isOwnerDevice" class="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p class="text-sm font-semibold">Become the library owner</p>
          <p class="text-[13.5px] text-emerald-700/80">No owner is set yet. Claim this account as the sole admin. You can then approve other admin requests.</p>
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

    <section v-else-if="hasPendingRequest" class="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <p class="text-sm font-semibold text-emerald-900">Admin request pending</p>
      <p class="text-[13.5px] text-emerald-700/80">Your request is awaiting the owner's approval.</p>
    </section>

    <section class="mb-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-700/80">Saved books</p>
        <p class="mt-3 font-display text-3xl font-semibold text-emerald-900">{{ savedBooks.length }}</p>
      </div>
      <div class="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-700/80">Borrowed now</p>
        <p class="mt-3 font-display text-3xl font-semibold text-emerald-900">{{ borrowedBooks.length }}</p>
      </div>
      <div class="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-700/80">Membership</p>
        <p class="mt-3 text-lg font-semibold text-emerald-900">{{ isAdmin ? 'Administrator' : 'Reader' }}</p>
      </div>
      <div class="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-700/80">Library access</p>
        <p class="mt-3 text-lg font-semibold text-emerald-900">24/7 access</p>
      </div>
    </section>

    <!-- Borrowed -->
    <section class="mb-10">
      <div class="mb-4 flex items-center justify-between gap-4">
        <h2 class="text-xl font-semibold text-emerald-900">Currently borrowed</h2>
        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-700/80">{{ borrowedBooks.length }} active</span>
      </div>
      <div v-if="borrowedBooks.length" class="flex flex-col gap-2.5">
        <div
          v-for="r in borrowedBooks"
          :key="r.bookId"
          class="flex items-center gap-3.5 rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm"
        >
          <NuxtLink
            :to="`/products/${r.book!.id}`"
            class="h-14 w-10 shrink-0 overflow-hidden rounded border border-emerald-100 bg-emerald-50"
          ><BookCoverImage :src="r.book!.coverUrl" :fallback="getCoverUrl(r.book!.category)" :alt="r.book!.title" :label="r.book!.title" class="h-full w-full" /></NuxtLink>
          <NuxtLink :to="`/products/${r.book!.id}`" class="flex-1">
            <p class="truncate text-sm font-semibold text-emerald-900">{{ r.book!.title }}</p>
            <p class="text-xs" :class="daysLeft(r.dueOn) <= 3 ? 'text-rose' : 'text-emerald-700/80'">
              Due {{ r.dueOn }} ({{ daysLeft(r.dueOn) }} days left)
            </p>
          </NuxtLink>
          <NuxtLink
            :to="`/products/${r.book!.id}/read`"
            class="text-xs font-semibold text-emerald-700 hover:underline"
            >Read</NuxtLink
          >
          <button
            class="rounded-xl border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-50"
            type="button"
            @click="onReturn(r.bookId)"
          >
            Return
          </button>
        </div>
      </div>
      <p v-else class="text-[14.5px] text-emerald-700/80">Nothing borrowed right now.</p>
    </section>

    <!-- Saved -->
    <section>
      <div class="mb-4 flex items-baseline justify-between gap-4">
        <h2 class="text-xl font-semibold text-emerald-900">Saved books</h2>
        <p class="font-mono text-xs text-emerald-700/80">{{ savedBooks.length }} saved</p>
      </div>
      <div v-if="savedBooks.length" class="flex flex-col gap-2.5">
        <div
          v-for="book in savedBooks"
          :key="book!.id"
          class="flex items-center gap-3.5 rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm"
        >
          <NuxtLink
            :to="`/products/${book!.id}`"
            class="h-14 w-10 shrink-0 overflow-hidden rounded border border-emerald-100 bg-emerald-50"
          ><BookCoverImage :src="book!.coverUrl" :fallback="getCoverUrl(book!.category)" :alt="book!.title" :label="book!.title" class="h-full w-full" /></NuxtLink>
          <NuxtLink :to="`/products/${book!.id}`" class="flex-1">
            <p class="text-sm font-semibold">{{ book!.title }}</p>
            <p class="text-xs text-emerald-700/80">{{ book!.author }} &middot; {{ book!.format }}</p>
          </NuxtLink>
          <StarRating :rating="book!.rating" :size="10" />
        </div>
      </div>
      <p v-else class="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-6 text-[14.5px] text-emerald-700/80">
        Nothing saved yet. Browse the
        <NuxtLink to="/products" class="text-emerald-700 underline">catalog</NuxtLink> and save a few
        titles.
      </p>
    </section>
  </div>
</template>
