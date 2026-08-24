<script setup lang="ts">
import { getBookById, getRelatedBooks, availableCopies, formatYear } from '~/data/books'

const route = useRoute()
const id = computed(() => Number(route.params.id))
const book = computed(() => getBookById(id.value))

if (!book.value) {
  throw createError({ statusCode: 404, statusMessage: 'Book not found', fatal: true })
}

const related = computed(() => book.value ? getRelatedBooks(book.value) : [])

useHead(() => ({
  title: book.value ? `${book.value.title} — Marginalia` : 'Marginalia'
}))

const saved = ref(false)
const activeTab = ref<'description' | 'contents' | 'reviews' | 'citation'>('description')

const copiesLeft = computed(() => book.value ? availableCopies(book.value) : 0)

const ratingBreakdown = computed(() => {
  if (!book.value) return []
  const total = book.value.reviews.length || 1
  return [5, 4, 3, 2, 1].map(star => {
    const count = book.value!.reviews.filter(r => Math.round(r.rating) === star).length
    return { star, count, pct: Math.round((count / total) * 100) }
  })
})

const apaCitation = computed(() => {
  if (!book.value) return ''
  const b = book.value
  const yearLabel = formatYear(b.year)
  return `${b.author} (${yearLabel}). ${b.title} (${b.edition === 1 ? '1st' : b.edition + 'th'} ed.). ${b.publisher}.`
})

const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'contents', label: 'Table of Contents' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'citation', label: 'Cite this' }
] as const
</script>

<template>
  <div v-if="book" class="max-w-6xl mx-auto px-6 py-9 pb-20">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 flex-wrap text-xs text-ink-soft mb-7" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-ink hover:underline">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/products" class="hover:text-ink hover:underline">Products</NuxtLink>
      <span>/</span>
      <NuxtLink :to="`/products?category=${book.category}`" class="hover:text-ink hover:underline">{{ book.category }}</NuxtLink>
      <span>/</span>
      <span class="text-ink font-semibold">{{ book.title }}</span>
    </nav>

    <div class="grid lg:grid-cols-[260px_1fr] gap-12">
      <!-- Sidebar: cover, availability, actions, facts -->
      <aside class="lg:sticky lg:top-24 self-start flex flex-col gap-4">
        <div
          class="h-[300px] rounded-card p-5 flex flex-col justify-between text-parchment shadow-cover"
          :style="{ background: book.spineColor }"
        >
          <span class="self-start font-mono text-[10px] uppercase tracking-wide bg-black/25 px-2 py-0.5 rounded-full">{{ book.level }}</span>
          <div>
            <p class="font-display font-semibold text-xl leading-snug">{{ book.title }}</p>
            <p class="font-mono text-[11.5px] opacity-85 mt-1.5">{{ book.pages }}p &middot; {{ book.format }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-[13px] text-ink-soft">
          <span class="w-2 h-2 rounded-full shrink-0" :class="copiesLeft > 0 ? 'bg-sage' : 'bg-amber-deep'" />
          <span v-if="copiesLeft > 0">{{ copiesLeft }} of {{ book.availability.digitalCopies }} copies available</span>
          <span v-else>All copies currently checked out</span>
        </div>

        <div class="flex flex-col gap-2">
          <button
            class="rounded-card font-semibold text-sm px-5 py-2.5 transition text-center"
            :class="saved ? 'border border-line text-ink hover:border-ink' : 'bg-amber text-ink hover:bg-amber-deep'"
            type="button"
            @click="saved = !saved"
          >
            {{ saved ? 'Saved ✓' : 'Save to my account' }}
          </button>
          <button
            class="rounded-card bg-ink text-parchment font-semibold text-sm px-5 py-2.5 hover:bg-ink-light transition disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            :disabled="copiesLeft === 0"
          >
            {{ copiesLeft > 0 ? 'Borrow this book' : 'Join waitlist' }}
          </button>
        </div>

        <dl class="flex flex-col gap-2.5 pt-3.5 border-t border-line text-[12.5px]">
          <div class="flex justify-between gap-3"><dt class="text-ink-soft">Call number</dt><dd class="font-mono font-semibold">{{ book.callNumber }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-ink-soft">ISBN</dt><dd class="font-semibold">{{ book.isbn }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-ink-soft">Publisher</dt><dd class="font-semibold text-right">{{ book.publisher }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-ink-soft">Edition</dt><dd class="font-semibold">{{ book.edition === 1 ? '1st' : `${book.edition}th` }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-ink-soft">Language</dt><dd class="font-semibold text-right">{{ book.language }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-ink-soft">Format</dt><dd class="font-semibold">{{ book.format }} &middot; {{ book.fileSizeMb }} MB</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-ink-soft">Reading time</dt><dd class="font-semibold">~{{ book.readingTimeHours }} hrs</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-ink-soft">Added to catalog</dt><dd class="font-semibold">{{ book.addedDate }}</dd></div>
        </dl>
      </aside>

      <!-- Main -->
      <div>
        <span class="font-mono text-[11.5px] uppercase tracking-wide text-amber-deep">{{ book.category }}</span>
        <h1 class="font-display font-semibold text-[clamp(26px,3.6vw,38px)] mt-2">{{ book.title }}</h1>
        <p class="text-ink-soft text-[15px] mt-1.5">by {{ book.author }} &middot; {{ formatYear(book.year) }}</p>

        <div class="flex items-center gap-2.5 flex-wrap mt-4">
          <StarRating :rating="book.rating" :size="16" />
          <span class="font-bold text-[15px]">{{ book.rating.toFixed(1) }}</span>
          <span class="text-[13px] text-ink-soft">{{ book.ratingsCount }} ratings &middot; {{ book.reviews.length }} reviews</span>
        </div>

        <!-- Subject headings -->
        <div class="flex flex-wrap gap-2 mt-4">
          <NuxtLink
            v-for="subject in book.subjects"
            :key="subject"
            :to="`/products?q=${subject}`"
            class="font-mono text-[11px] px-3 py-1.5 rounded-full bg-parchment-dim text-ink-soft border border-line hover:border-ink hover:text-ink transition"
          >
            {{ subject }}
          </NuxtLink>
        </div>

        <!-- Tabs -->
        <div class="flex gap-5 mt-7 border-b border-line overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="text-[13.5px] font-semibold pb-2.5 border-b-2 whitespace-nowrap"
            :class="activeTab === tab.id ? 'text-ink border-amber' : 'text-ink-soft border-transparent hover:text-ink'"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Description -->
        <div v-if="activeTab === 'description'" class="pt-6">
          <p v-for="(para, i) in book.longDescription" :key="i" class="text-ink-soft text-[14.5px] max-w-[66ch] mb-4 leading-relaxed">{{ para }}</p>
        </div>

        <!-- Table of contents -->
        <div v-else-if="activeTab === 'contents'" class="pt-6">
          <ol class="max-w-[52ch]">
            <li v-for="(chapter, i) in book.tableOfContents" :key="chapter" class="flex gap-3.5 py-2.5 border-b border-line text-sm">
              <span class="font-mono text-amber-deep text-xs shrink-0">{{ String(i + 1).padStart(2, '0') }}</span>
              <span>{{ chapter }}</span>
            </li>
          </ol>
        </div>

        <!-- Reviews -->
        <div v-else-if="activeTab === 'reviews'" class="pt-6">
          <div class="flex gap-10 flex-wrap pb-6 mb-6 border-b border-line">
            <div class="flex flex-col gap-1.5 items-start">
              <span class="font-display font-semibold text-4xl">{{ book.rating.toFixed(1) }}</span>
              <StarRating :rating="book.rating" :size="14" />
              <span class="text-xs text-ink-soft">{{ book.ratingsCount }} ratings</span>
            </div>
            <div class="flex-1 min-w-[200px] flex flex-col gap-1.5 justify-center">
              <div v-for="row in ratingBreakdown" :key="row.star" class="flex items-center gap-2.5 text-xs">
                <span class="w-6 font-mono text-ink-soft">{{ row.star }}★</span>
                <div class="flex-1 h-1.5 bg-parchment-dim rounded-full overflow-hidden">
                  <div class="h-full bg-amber" :style="{ width: row.pct + '%' }" />
                </div>
                <span class="w-5 text-right font-mono text-ink-soft">{{ row.count }}</span>
              </div>
            </div>
          </div>

          <ul class="flex flex-col gap-5">
            <li v-for="(rev, i) in book.reviews" :key="i">
              <div class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-full bg-ink text-parchment flex items-center justify-center font-display font-semibold text-[13px] shrink-0">{{ rev.name.charAt(0) }}</span>
                <div>
                  <p class="text-[13.5px] font-semibold">{{ rev.name }}</p>
                  <StarRating :rating="rev.rating" :size="11" />
                </div>
                <span class="ml-auto font-mono text-[11.5px] text-ink-soft">{{ rev.date }}</span>
              </div>
              <p class="text-sm text-ink-soft mt-2.5 ml-12 max-w-[60ch]">{{ rev.comment }}</p>
            </li>
          </ul>
        </div>

        <!-- Citation -->
        <div v-else class="pt-6">
          <p class="text-[13px] text-ink-soft mb-3">APA-style citation for this edition:</p>
          <div class="bg-parchment-dim border border-line rounded-card p-4 font-mono text-[13px] leading-relaxed max-w-[62ch]">
            {{ apaCitation }}
          </div>
        </div>
      </div>
    </div>

    <!-- Related -->
    <section v-if="related.length" class="mt-16 pt-8 border-t border-line">
      <h2 class="text-xl font-display font-semibold mb-5">More in {{ book.category }}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <BookCard v-for="b in related" :key="b.id" :book="b" />
      </div>
    </section>
  </div>
</template>
