<script setup lang="ts">
import { getCoverUrl, type Book } from '~/data/books'

defineProps<{ book: Book }>()
</script>

<template>
  <NuxtLink
    :to="`/products/${book.id}`"
    class="motion-rise premium-interaction sheen-on-hover group block overflow-hidden rounded-2xl border border-emerald-100 bg-white p-3 shadow-premium hover:-translate-y-1 hover:border-emerald-300 hover:shadow-card"
  >
    <div
      class="relative flex h-60 items-center justify-center overflow-hidden rounded-xl p-5 sm:h-64"
      :style="{ backgroundColor: book.spineColor }"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-ink/35" />
      <BookCoverImage
        :src="book.coverUrl"
        :fallback="getCoverUrl(book.category)"
        :alt="`Cover for ${book.title}`"
        :label="book.title"
        class="relative aspect-[2/3] h-full max-w-[11rem] overflow-hidden rounded-md border border-white/30 bg-white/10 shadow-cover transition duration-700 [transition-timing-function:var(--ease-luxury)] group-hover:-translate-y-1 group-hover:rotate-[-1deg] group-hover:scale-[1.015]"
      />
      <span
        class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-wide text-emerald-900"
        >{{ book.level }}</span
      >
      <span
        class="absolute bottom-3 right-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/80"
        >{{ book.category }}</span
      >
    </div>
    <div class="px-1 pb-1 pt-4">
      <p class="line-clamp-2 min-h-12 font-display text-lg font-semibold leading-tight text-emerald-900">
        {{ book.title }}
      </p>
      <p class="mt-1 truncate text-sm text-emerald-700">{{ book.author }}</p>
      <div class="mt-3 flex items-center justify-between gap-2">
        <StarRating :rating="book.rating" :size="10" /><span
          class="font-mono text-[10.5px] text-emerald-700"
          >{{ book.pages }} pages</span
        >
      </div>
      <div class="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <span class="text-sm font-semibold text-emerald-800">Read online</span
        ><span
          v-if="book.exchangeable"
          class="font-mono text-[9.5px] uppercase tracking-wide text-emerald-700"
          >Exchangeable</span
        >
      </div>
    </div>
  </NuxtLink>
</template>
