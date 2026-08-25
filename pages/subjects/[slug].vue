<script setup lang="ts">
import { getSubjectBySlug } from '~/data/subjects'
import { useCatalog } from '~/composables/useCatalog'

const route = useRoute()
const subject = computed(() => getSubjectBySlug(route.params.slug as string))

if (!subject.value) {
  throw createError({ statusCode: 404, statusMessage: 'Subject not found', fatal: true })
}

const { books } = useCatalog()

const shelfBooks = computed(() =>
  subject.value ? books.value.filter(b => b.category === subject.value!.name) : []
)

const avgRating = computed(() => {
  if (!shelfBooks.value.length) return 0
  return shelfBooks.value.reduce((sum, b) => sum + b.rating, 0) / shelfBooks.value.length
})

const topRated = computed(() => [...shelfBooks.value].sort((a, b) => b.rating - a.rating).slice(0, 3))

const levelCounts = computed(() => {
  const counts: Record<string, number> = { Beginner: 0, Intermediate: 0, Advanced: 0 }
  shelfBooks.value.forEach(b => { counts[b.level] = (counts[b.level] || 0) + 1 })
  return counts
})

useHead(() => ({ title: subject.value ? `${subject.value.name} — Marginalia` : 'Marginalia' }))
</script>

<template>
  <div v-if="subject" class="max-w-6xl mx-auto px-6 py-12 pb-20">
    <nav class="flex items-center gap-2 text-xs text-ink-soft mb-7" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-ink hover:underline">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/subjects" class="hover:text-ink hover:underline">Subjects</NuxtLink>
      <span>/</span>
      <span class="text-ink font-semibold">{{ subject.name }}</span>
    </nav>

    <header class="flex items-start gap-5 mb-10 flex-wrap">
      <div class="w-14 h-14 rounded-card flex items-center justify-center shrink-0" :style="{ background: subject.color + '1a' }">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" :style="{ color: subject.color }">
          <path :d="subject.icon" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="flex-1 min-w-[240px]">
        <h1 class="font-display font-semibold text-[clamp(26px,3.6vw,36px)]">{{ subject.name }}</h1>
        <p class="text-ink-soft text-[15px] mt-2 max-w-[62ch]">{{ subject.description }}</p>
      </div>
    </header>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
      <div class="border border-line rounded-card bg-white p-4 text-center">
        <p class="font-display font-semibold text-2xl">{{ shelfBooks.length }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Titles</p>
      </div>
      <div class="border border-line rounded-card bg-white p-4 text-center">
        <p class="font-display font-semibold text-2xl">{{ avgRating.toFixed(1) }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Avg rating</p>
      </div>
      <div class="border border-line rounded-card bg-white p-4 text-center">
        <p class="font-display font-semibold text-2xl">{{ levelCounts.Beginner }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Beginner</p>
      </div>
      <div class="border border-line rounded-card bg-white p-4 text-center">
        <p class="font-display font-semibold text-2xl">{{ levelCounts.Advanced }}</p>
        <p class="font-mono text-[10.5px] uppercase tracking-wide text-ink-soft mt-1">Advanced</p>
      </div>
    </div>

    <section v-if="topRated.length" class="mb-14">
      <h2 class="text-xl font-display font-semibold mb-5">Top rated on this shelf</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <BookCard v-for="b in topRated" :key="b.id" :book="b" />
      </div>
    </section>

    <section>
      <div class="flex items-baseline justify-between mb-5">
        <h2 class="text-xl font-display font-semibold">Full shelf</h2>
        <NuxtLink :to="`/products?category=${subject.name}`" class="text-sm font-semibold text-amber-deep hover:underline">Open in catalog &rarr;</NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <BookCard v-for="b in shelfBooks" :key="b.id" :book="b" />
      </div>
    </section>
  </div>
</template>
