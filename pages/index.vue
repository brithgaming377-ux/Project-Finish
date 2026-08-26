<script setup lang="ts">
import { subjects } from '~/data/subjects'
import { useCatalog } from '~/composables/useCatalog'
const { books } = useCatalog()
const router = useRouter()
const searchQuery = ref('')
const subjectCounts = computed(() => subjects.map(subject => ({ ...subject, count: books.value.filter(book => book.category === subject.name).length })))
const featured = computed(() => books.value.slice(0, 3))
function onSearch() { router.push({ path: '/products', query: searchQuery.value ? { q: searchQuery.value } : {} }) }
</script>

<template>
  <div>
    <section class="relative isolate overflow-hidden bg-ink py-16 sm:py-24">
      <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1800&q=85" alt="Students studying in a library" class="absolute inset-0 -z-20 h-full w-full object-cover opacity-35" />
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/45" />
      <div class="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div class="max-w-2xl text-white">
          <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-amber"><span class="h-1.5 w-1.5 rounded-full bg-amber" /> ETEC Center Digital Library</div>
          <h1 class="font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">Knowledge that moves<br />with your ambition.</h1>
          <p class="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">ETEC-LIBRARY brings useful books, fresh ideas, and study-ready resources together in one calm place for every learner.</p>
          <form class="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row" @submit.prevent="onSearch"><div class="flex flex-1 items-center gap-3 px-3"><svg class="text-ink-soft" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input v-model="searchQuery" type="search" placeholder="Search books, authors, subjects…" class="w-full bg-transparent py-2 text-sm text-ink outline-none" /></div><button type="submit" class="rounded-xl bg-amber px-6 py-3 text-sm font-bold text-ink transition hover:bg-amber-deep hover:text-white">Explore books</button></form>
          <div class="mt-8 flex gap-8 text-sm text-white/70"><span><strong class="block text-2xl font-semibold text-white">{{ books.length }}+</strong> digital books</span><span><strong class="block text-2xl font-semibold text-white">{{ subjects.length }}</strong> learning shelves</span><span><strong class="block text-2xl font-semibold text-white">24/7</strong> open access</span></div>
        </div>
        <div class="hidden rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur md:block"><p class="font-mono text-[11px] uppercase tracking-[0.16em] text-amber">Featured this week</p><NuxtLink v-if="featured[0]" :to="`/products/${featured[0].id}`" class="mt-5 block overflow-hidden rounded-2xl bg-white text-ink"><img :src="featured[0].coverUrl" :alt="featured[0].title" class="h-40 w-full object-cover" /><div class="p-4"><p class="font-display text-xl font-semibold">{{ featured[0].title }}</p><p class="mt-1 text-sm text-ink-soft">{{ featured[0].author }}</p></div></NuxtLink></div>
      </div>
    </section>
    <section class="mx-auto max-w-7xl px-6 py-16"><div class="flex flex-wrap items-end justify-between gap-4"><div><p class="font-mono text-xs uppercase tracking-[0.16em] text-amber-deep">Start exploring</p><h2 class="mt-2 font-display text-3xl font-semibold">Choose your learning shelf.</h2></div><NuxtLink to="/subjects" class="text-sm font-semibold text-amber-deep hover:underline">View every subject →</NuxtLink></div><div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><NuxtLink v-for="subject in subjectCounts" :key="subject.slug" :to="`/subjects/${subject.slug}`" class="group rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-1 hover:shadow-card"><div class="flex items-center justify-between"><span class="flex h-11 w-11 items-center justify-center rounded-xl" :style="{ background: subject.color + '18', color: subject.color }"><svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path :d="subject.icon" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span><span class="text-lg text-ink-soft transition group-hover:translate-x-1">→</span></div><p class="mt-7 font-display text-xl font-semibold">{{ subject.name }}</p><p class="mt-1 text-sm text-ink-soft">{{ subject.count }} titles to explore</p></NuxtLink></div></section>
    <section class="bg-parchment-dim py-16"><div class="mx-auto max-w-7xl px-6"><div class="flex flex-wrap items-end justify-between gap-4"><div><p class="font-mono text-xs uppercase tracking-[0.16em] text-amber-deep">Reader favorites</p><h2 class="mt-2 font-display text-3xl font-semibold">Make space for a new perspective.</h2></div><NuxtLink to="/products" class="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink-light">Browse all books</NuxtLink></div><div class="mt-8 grid gap-5 md:grid-cols-3"><BookCard v-for="book in featured" :key="book.id" :book="book" /></div></div></section>
    <section class="mx-auto max-w-7xl px-6 py-16"><div class="grid overflow-hidden rounded-3xl bg-[#DDE9E2] lg:grid-cols-2"><img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85" alt="Students learning together" class="h-64 w-full object-cover lg:h-full" /><div class="p-8 sm:p-12"><p class="font-mono text-xs uppercase tracking-[0.16em] text-sage">Made for the ETEC community</p><h2 class="mt-3 font-display text-3xl font-semibold">Study smarter. Share what you discover.</h2><p class="mt-4 max-w-md leading-relaxed text-ink-soft">Build your reading list, discover course-ready titles, and exchange ideas with the ETEC learning community.</p><NuxtLink to="/about" class="mt-7 inline-flex rounded-xl border border-ink px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white">Discover ETEC-LIBRARY</NuxtLink></div></div></section>
  </div>
</template>
