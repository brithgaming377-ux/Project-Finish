<script setup lang="ts">
import type { Book } from '~/data/books'

defineProps<{ book: Book }>()
</script>

<template>
  <NuxtLink
    :to="`/products/${book.id}`"
    class="block bg-white border border-line rounded-card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-card"
  >
    <div
      class="h-36 flex flex-col justify-between p-3.5 text-parchment relative overflow-hidden"
      :style="{ background: book.spineColor }"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" aria-hidden="true" />
      <span class="relative self-start font-mono text-[9.5px] uppercase tracking-wide bg-black/25 px-1.5 py-0.5 rounded-full">
        {{ book.level }}
      </span>
      <div class="relative">
        <p class="font-display font-semibold text-[15px] leading-tight">{{ book.title }}</p>
        <p class="font-mono text-[10.5px] opacity-85 mt-1">{{ book.pages }}p &middot; {{ book.format }}</p>
      </div>
    </div>
    <div class="p-3.5">
      <p class="text-sm font-semibold leading-tight">{{ book.title }}</p>
      <p class="text-[13px] text-ink-soft mt-0.5 mb-2.5">{{ book.author }}</p>
      <div class="flex items-center justify-between gap-2">
        <span class="font-mono text-[10.5px] uppercase tracking-wide text-amber-deep">{{ book.category }}</span>
        <StarRating :rating="book.rating" :size="10" />
      </div>
      <div class="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-line">
        <span class="font-display font-semibold text-[13px]">${{ book.price.toFixed(2) }}</span>
        <span v-if="book.exchangeable" class="font-mono text-[9.5px] uppercase tracking-wide text-sage">Exchangeable</span>
      </div>
    </div>
  </NuxtLink>
</template>
