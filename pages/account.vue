<script setup lang="ts">
import { useCatalog } from '~/composables/useCatalog'
import { useLibrary } from '~/composables/useLibrary'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { user, isAdmin, logout } = useAuth()
const { getById } = useCatalog()
const { state, returnBook } = useLibrary()
const { push: toast } = useToast()

if (import.meta.client && !user.value) {
  router.push({ path: '/login', query: { redirect: '/account' } })
}

const savedBooks = computed(() => state.value.saved.map(id => getById(id)).filter(Boolean))
const borrowedBooks = computed(() => state.value.borrowed.map(r => ({ ...r, book: getById(r.bookId) })).filter(r => r.book))
const purchasedBooks = computed(() => state.value.purchased.map(id => getById(id)).filter(Boolean))

function daysLeft(dueOn: string) {
  const diff = Math.ceil((new Date(dueOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}

function onReturn(id: number) {
  returnBook(id)
  toast('Returned. Thanks!')
}

function onLogout() {
  logout()
  toast('Signed out.')
  router.push('/')
}
</script>

<template>
  <div v-if="user" class="max-w-3xl mx-auto px-6 py-14 pb-20">
    <header class="flex items-center justify-between mb-8 flex-wrap gap-3">
      <div>
        <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">Your account</p>
        <h1 class="font-display font-semibold text-[28px] mt-2">Welcome back, {{ user.name }}.</h1>
      </div>
      <button type="button" class="rounded-card border border-line text-ink text-sm font-semibold px-5 py-2.5 hover:border-ink transition" @click="onLogout">Sign out</button>
    </header>

    <section class="flex items-center gap-4 bg-white border border-line rounded-card p-4.5 mb-6">
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
      <span class="ml-auto font-mono text-[11px] uppercase tracking-wide bg-parchment-dim border border-line px-2.5 py-1 rounded-full text-ink-soft">
        {{ isAdmin ? 'Admin' : 'Free member' }}
      </span>
    </section>

    <section class="grid grid-cols-3 gap-3 mb-10">
      <div class="border border-line rounded-card bg-white p-4 text-center">
        <p class="font-display font-semibold text-xl">{{ savedBooks.length }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Saved</p>
      </div>
      <div class="border border-line rounded-card bg-white p-4 text-center">
        <p class="font-display font-semibold text-xl">{{ borrowedBooks.length }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Borrowed</p>
      </div>
      <div class="border border-line rounded-card bg-white p-4 text-center">
        <p class="font-display font-semibold text-xl">{{ purchasedBooks.length }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Purchased</p>
      </div>
    </section>

    <!-- Borrowed -->
    <section class="mb-10">
      <h2 class="text-xl font-semibold mb-4">Currently borrowed</h2>
      <div v-if="borrowedBooks.length" class="flex flex-col gap-2.5">
        <div v-for="r in borrowedBooks" :key="r.bookId" class="flex items-center gap-3.5 bg-white border border-line rounded-card p-3">
          <NuxtLink :to="`/products/${r.book!.id}`" class="w-9 h-11 rounded shrink-0" :style="{ background: r.book!.spineColor }" />
          <NuxtLink :to="`/products/${r.book!.id}`" class="flex-1">
            <p class="text-sm font-semibold">{{ r.book!.title }}</p>
            <p class="text-xs" :class="daysLeft(r.dueOn) <= 3 ? 'text-rose' : 'text-ink-soft'">Due {{ r.dueOn }} ({{ daysLeft(r.dueOn) }} days left)</p>
          </NuxtLink>
          <NuxtLink :to="`/products/${r.book!.id}/read`" class="text-xs font-semibold text-amber-deep hover:underline">Read</NuxtLink>
          <button class="text-xs text-ink-soft border border-line rounded-card px-3 py-1.5 hover:border-ink hover:text-ink transition" type="button" @click="onReturn(r.bookId)">Return</button>
        </div>
      </div>
      <p v-else class="text-ink-soft text-[14.5px]">Nothing borrowed right now.</p>
    </section>

    <!-- Purchased -->
    <section class="mb-10">
      <h2 class="text-xl font-semibold mb-4">Purchased books</h2>
      <div v-if="purchasedBooks.length" class="flex flex-col gap-2.5">
        <div v-for="book in purchasedBooks" :key="book!.id" class="flex items-center gap-3.5 bg-white border border-line rounded-card p-3">
          <NuxtLink :to="`/products/${book!.id}`" class="w-9 h-11 rounded shrink-0" :style="{ background: book!.spineColor }" />
          <NuxtLink :to="`/products/${book!.id}`" class="flex-1">
            <p class="text-sm font-semibold">{{ book!.title }}</p>
            <p class="text-xs text-ink-soft">{{ book!.author }}</p>
          </NuxtLink>
          <NuxtLink :to="`/products/${book!.id}/read`" class="text-xs font-semibold text-amber-deep hover:underline">Read</NuxtLink>
        </div>
      </div>
      <p v-else class="text-ink-soft text-[14.5px]">
        No purchases yet. Browse the <NuxtLink to="/products" class="text-amber-deep underline">catalog</NuxtLink>.
      </p>
    </section>

    <!-- Saved -->
    <section>
      <div class="flex items-baseline justify-between mb-4">
        <h2 class="text-xl font-semibold">Saved books</h2>
        <p class="font-mono text-xs text-ink-soft">{{ savedBooks.length }} saved</p>
      </div>
      <div v-if="savedBooks.length" class="flex flex-col gap-2.5">
        <div v-for="book in savedBooks" :key="book!.id" class="flex items-center gap-3.5 bg-white border border-line rounded-card p-3">
          <NuxtLink :to="`/products/${book!.id}`" class="w-9 h-11 rounded shrink-0" :style="{ background: book!.spineColor }" />
          <NuxtLink :to="`/products/${book!.id}`" class="flex-1">
            <p class="text-sm font-semibold">{{ book!.title }}</p>
            <p class="text-xs text-ink-soft">{{ book!.author }} &middot; {{ book!.format }}</p>
          </NuxtLink>
          <StarRating :rating="book!.rating" :size="10" />
        </div>
      </div>
      <p v-else class="text-ink-soft text-[14.5px]">
        Nothing saved yet. Browse the <NuxtLink to="/products" class="text-amber-deep underline">catalog</NuxtLink> and save a few titles.
      </p>
    </section>
  </div>
</template>
