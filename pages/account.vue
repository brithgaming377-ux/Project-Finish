<script setup lang="ts">
import { books } from '~/data/books'

const savedIds = ref<number[]>([1, 9, 16])
const savedBooks = computed(() => books.filter(b => savedIds.value.includes(b.id)))

function remove(id: number) {
  savedIds.value = savedIds.value.filter(i => i !== id)
}

const readingStats = [
  { label: 'Books saved', value: savedIds.value.length },
  { label: 'Categories explored', value: new Set(books.filter(b => savedIds.value.includes(b.id)).map(b => b.category)).size },
  { label: 'Member since', value: '2026' }
]
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-14 pb-20">
    <header class="flex items-center justify-between mb-8">
      <div>
        <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">Your account</p>
        <h1 class="font-display font-semibold text-[28px] mt-2">Welcome back, Reader.</h1>
      </div>
      <NuxtLink to="/login" class="rounded-card border border-line text-ink text-sm font-semibold px-5 py-2.5 hover:border-ink transition">Sign out</NuxtLink>
    </header>

    <section class="flex items-center gap-4 bg-white border border-line rounded-card p-4.5 mb-6">
      <div class="w-11 h-11 rounded-full bg-ink text-parchment flex items-center justify-center font-display font-semibold shrink-0">R</div>
      <div>
        <p class="text-sm font-semibold">Reader Account</p>
        <p class="text-[13.5px] text-ink-soft">reader@marginalia.app</p>
      </div>
      <span class="ml-auto font-mono text-[11px] uppercase tracking-wide bg-parchment-dim border border-line px-2.5 py-1 rounded-full text-ink-soft">Free member</span>
    </section>

    <section class="grid grid-cols-3 gap-3 mb-10">
      <div v-for="s in readingStats" :key="s.label" class="border border-line rounded-card bg-white p-4 text-center">
        <p class="font-display font-semibold text-xl">{{ s.value }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">{{ s.label }}</p>
      </div>
    </section>

    <section>
      <div class="flex items-baseline justify-between mb-4">
        <h2 class="text-xl font-semibold">Saved books</h2>
        <p class="font-mono text-xs text-ink-soft">{{ savedBooks.length }} saved</p>
      </div>

      <div v-if="savedBooks.length" class="flex flex-col gap-2.5">
        <div v-for="book in savedBooks" :key="book.id" class="flex items-center gap-3.5 bg-white border border-line rounded-card p-3">
          <NuxtLink :to="`/products/${book.id}`" class="w-8.5 h-11 w-9 h-11 rounded shrink-0" :style="{ background: book.spineColor }" />
          <NuxtLink :to="`/products/${book.id}`" class="flex-1">
            <p class="text-sm font-semibold">{{ book.title }}</p>
            <p class="text-xs text-ink-soft">{{ book.author }} &middot; {{ book.format }}</p>
          </NuxtLink>
          <StarRating :rating="book.rating" :size="10" />
          <button
            class="text-xs text-ink-soft border border-line rounded-card px-3 py-1.5 hover:border-ink hover:text-ink transition"
            type="button"
            @click="remove(book.id)"
            :aria-label="`Remove ${book.title} from saved`"
          >
            Remove
          </button>
        </div>
      </div>
      <p v-else class="text-ink-soft text-[14.5px]">
        Nothing saved yet. Browse the <NuxtLink to="/products" class="text-amber-deep underline">catalog</NuxtLink> and save a few titles.
      </p>
    </section>
  </div>
</template>
