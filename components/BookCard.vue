<script setup lang="ts">
import type { Book } from '~/data/books'

defineProps<{ book: Book }>()
</script>

<template>
  <NuxtLink :to="`/products/${book.id}`" class="group block overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-card">
    <div class="relative h-56 overflow-hidden bg-parchment-dim sm:h-64">
      <img :src="book.coverUrl" :alt="`Cover for ${book.title}`" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div class="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
      <span class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 font-mono text-[9.5px] uppercase tracking-wide text-ink">{{ book.level }}</span>
      <div class="absolute inset-x-0 bottom-0 p-4 text-white">
        <p class="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">{{ book.category }}</p>
        <p class="mt-1 line-clamp-2 font-display text-lg font-semibold leading-tight">{{ book.title }}</p>
      </div>
    </div>
    <div class="p-4">
      <p class="truncate text-sm text-ink-soft">{{ book.author }}</p>
      <div class="mt-2 flex items-center justify-between gap-2"><StarRating :rating="book.rating" :size="10" /><span class="font-mono text-[10.5px] text-ink-soft">{{ book.pages }} pages</span></div>
      <div class="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3"><span class="text-sm font-semibold text-ink">Read online</span><span v-if="book.exchangeable" class="font-mono text-[9.5px] uppercase tracking-wide text-sage">Exchangeable</span></div>
    </div>
  </NuxtLink>
</template>
