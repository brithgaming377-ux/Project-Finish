<script setup lang="ts">
import { useCatalog } from '~/composables/useCatalog'
import { useLibrary } from '~/composables/useLibrary'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { user, isAdmin, logout } = useAuth()
const { isAdminDevice, hasPendingRequest, isClaimed, requestAdmin } = useAdminAccess()
const { getById, updateBook } = useCatalog()
const { state, returnBook } = useLibrary()
const { requests, updateStatus } = useRequests()
const { push: toast } = useToast()

if (import.meta.client && !user.value) {
  router.push({ path: '/login', query: { redirect: '/account' } })
} else if (import.meta.client && isAdmin.value) {
  router.replace('/admin')
}

const savedBooks = computed(() => state.value.saved.map((id) => getById(id)).filter(Boolean))
const approvedBorrowRequests = computed(() => requests.value.filter((request) => request.userEmail === user.value?.email && request.kind === 'borrow' && request.status === 'approved'))
const borrowedBooks = computed(() => [
  ...state.value.borrowed.map((r) => ({ ...r, book: getById(r.bookId) })),
  ...approvedBorrowRequests.value.map((request) => ({ bookId: request.bookId, borrowedOn: request.processedOn || request.requestedOn, dueOn: new Date(new Date(request.processedOn || request.requestedOn).getTime() + 14 * 86400000).toISOString().slice(0, 10), requestId: request.id, book: getById(request.bookId) }))
].filter((r) => r.book))
const purchasedBooks = computed(() => {
  const approved = requests.value.filter((request) => request.userEmail === user.value?.email && request.kind === 'purchase' && request.status === 'approved').map((request) => request.bookId)
  return [...new Set([...state.value.purchased, ...approved])].map((id) => getById(id)).filter(Boolean)
})

function daysLeft(dueOn: string) {
  const diff = Math.ceil((new Date(dueOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}

function onReturn(id: number) {
  const request = approvedBorrowRequests.value.find((item) => item.bookId === id)
  if (request) {
    updateStatus(request.id, 'returned')
    const book = getById(id)
    if (book) updateBook(id, { availability: { ...book.availability, checkedOut: Math.max(0, book.availability.checkedOut - 1) } })
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

const showRequest = ref(false)
const requestName = ref('')
const requestEmail = ref('')
const requestBusy = ref(false)

async function onSubmitRequest() {
  requestBusy.value = true
  try {
    await requestAdmin(requestName.value || user.value?.name || '', requestEmail.value || user.value?.email || '')
    showRequest.value = false
    toast('Admin request sent. The owner must approve it.')
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not send request.', 'error')
  } finally {
    requestBusy.value = false
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
        Sign out
      </button>
    </header>

    <section class="surface-card mb-6 flex items-center gap-4 p-5">
      <div
        class="w-11 h-11 rounded-full flex items-center justify-center font-display font-semibold shrink-0"
        :class="isAdmin ? 'bg-amber text-ink' : 'bg-ink text-white'"
      >
        {{ user.name.charAt(0) }}
      </div>
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

    <section v-if="!isAdmin && !isAdminDevice && isClaimed && !hasPendingRequest" class="surface-card mb-6 p-5">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p class="text-sm font-semibold">Want admin access?</p>
          <p class="text-[13.5px] text-ink-soft">Admin rights are approved by the owner. Send a request and wait for approval.</p>
        </div>
        <button
          type="button"
          class="rounded-card border border-ink text-ink text-sm font-semibold px-5 py-2.5 hover:bg-ink hover:text-white transition"
          @click="showRequest = true"
        >
          Request admin access
        </button>
      </div>
      <form v-if="showRequest" class="mt-4 flex flex-col gap-3 border-t border-line pt-4" @submit.prevent="onSubmitRequest">
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Name</span><input v-model.trim="requestName" type="text" :placeholder="user?.name" class="rounded-card border border-line bg-parchment-dim px-3 py-2 text-sm font-normal" /></label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Email</span><input v-model.trim="requestEmail" type="email" :placeholder="user?.email" class="rounded-card border border-line bg-parchment-dim px-3 py-2 text-sm font-normal" /></label>
        <div class="flex gap-2">
          <button type="submit" class="rounded-card bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-light" :disabled="requestBusy">{{ requestBusy ? 'Sending…' : 'Send request' }}</button>
          <button type="button" class="rounded-card border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft" @click="showRequest = false">Cancel</button>
        </div>
      </form>
    </section>

    <section v-else-if="hasPendingRequest" class="surface-card mb-6 p-5">
      <p class="text-sm font-semibold">Admin request pending</p>
      <p class="text-[13.5px] text-ink-soft">Your request is awaiting the owner's approval.</p>
    </section>

    <section class="grid grid-cols-3 gap-3 mb-10">
      <div class="surface-card p-4 text-center">
        <p class="font-display font-semibold text-xl">{{ savedBooks.length }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Saved</p>
      </div>
      <div class="surface-card p-4 text-center">
        <p class="font-display font-semibold text-xl">{{ borrowedBooks.length }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Borrowed</p>
      </div>
      <div class="surface-card p-4 text-center">
        <p class="font-display font-semibold text-xl">{{ purchasedBooks.length }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Purchased</p>
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
            class="w-9 h-11 rounded shrink-0"
            :style="{ background: r.book!.spineColor }"
          />
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

    <!-- Purchased -->
    <section class="mb-10">
      <h2 class="text-xl font-semibold mb-4">Purchased books</h2>
      <div v-if="purchasedBooks.length" class="flex flex-col gap-2.5">
        <div
          v-for="book in purchasedBooks"
          :key="book!.id"
          class="flex items-center gap-3.5 bg-white border border-line rounded-card p-3"
        >
          <NuxtLink
            :to="`/products/${book!.id}`"
            class="w-9 h-11 rounded shrink-0"
            :style="{ background: book!.spineColor }"
          />
          <NuxtLink :to="`/products/${book!.id}`" class="flex-1">
            <p class="text-sm font-semibold">{{ book!.title }}</p>
            <p class="text-xs text-ink-soft">{{ book!.author }}</p>
          </NuxtLink>
          <NuxtLink
            :to="`/products/${book!.id}/read`"
            class="text-xs font-semibold text-amber-deep hover:underline"
            >Read</NuxtLink
          >
        </div>
      </div>
      <p v-else class="text-ink-soft text-[14.5px]">
        No purchases yet. Browse the
        <NuxtLink to="/products" class="text-amber-deep underline">catalog</NuxtLink>.
      </p>
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
            class="w-9 h-11 rounded shrink-0"
            :style="{ background: book!.spineColor }"
          />
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
