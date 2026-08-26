<script setup lang="ts">
import { categories } from '~/data/books'
import { useCatalog } from '~/composables/useCatalog'

const { books } = useCatalog()
const route = useRoute()

const activeCategory = ref((route.query.category as string) || 'All')
const query = ref((route.query.q as string) || '')
const activeLevel = ref<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All')
const sortBy = ref<'relevance' | 'rating' | 'newest' | 'title'>('relevance')

const levels = ['Beginner', 'Intermediate', 'Advanced'] as const

const filteredBooks = computed(() => {
  let list = activeCategory.value === 'All'
    ? books.value
    : books.value.filter(b => b.category === activeCategory.value)

  if (activeLevel.value !== 'All') {
    list = list.filter(b => b.level === activeLevel.value)
  }

  if (query.value.trim()) {
    const q = query.value.trim().toLowerCase()
    list = list.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.tags.some(t => t.toLowerCase().includes(q)) ||
      b.subjects.some(t => t.toLowerCase().includes(q))
    )
  }

  const sorted = [...list]
  if (sortBy.value === 'rating') sorted.sort((a, b) => b.rating - a.rating)
  else if (sortBy.value === 'newest') sorted.sort((a, b) => b.year - a.year)
  else if (sortBy.value === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title))

  return sorted
})

function selectCategory(cat: string) {
  activeCategory.value = cat
}

function clearFilters() {
  activeCategory.value = 'All'
  activeLevel.value = 'All'
  query.value = ''
  sortBy.value = 'relevance'
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-12">
    <header class="max-w-3xl mb-10">
      <p class="font-mono text-xs uppercase tracking-[0.16em] text-amber-deep">ETEC-LIBRARY / Collection</p>
      <h1 class="font-display font-semibold text-[clamp(32px,4vw,48px)] mt-2">Find a book for every bright idea.</h1>
      <p class="text-ink-soft text-[15px] mt-3">Every book in Marginalia, in one place — filter by subject or level, search by title, tag or author.</p>
    </header>

    <div class="grid lg:grid-cols-[230px_1fr] gap-8">
      <!-- Sidebar filters -->
      <aside class="space-y-7">
        <div>
          <h3 class="font-mono text-xs uppercase tracking-wide text-ink-soft mb-3">Subject</h3>
          <div class="flex flex-col gap-1.5">
            <button
              class="text-left text-sm px-2.5 py-1.5 rounded-card"
              :class="activeCategory === 'All' ? 'bg-ink text-parchment' : 'text-ink-soft hover:bg-parchment-dim'"
              @click="selectCategory('All')"
            >
              All subjects
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              class="text-left text-sm px-2.5 py-1.5 rounded-card"
              :class="activeCategory === cat ? 'bg-ink text-parchment' : 'text-ink-soft hover:bg-parchment-dim'"
              @click="selectCategory(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <div>
          <h3 class="font-mono text-xs uppercase tracking-wide text-ink-soft mb-3">Level</h3>
          <div class="flex flex-col gap-1.5">
            <button
              class="text-left text-sm px-2.5 py-1.5 rounded-card"
              :class="activeLevel === 'All' ? 'bg-ink text-parchment' : 'text-ink-soft hover:bg-parchment-dim'"
              @click="activeLevel = 'All'"
            >
              All levels
            </button>
            <button
              v-for="lvl in levels"
              :key="lvl"
              class="text-left text-sm px-2.5 py-1.5 rounded-card"
              :class="activeLevel === lvl ? 'bg-ink text-parchment' : 'text-ink-soft hover:bg-parchment-dim'"
              @click="activeLevel = lvl"
            >
              {{ lvl }}
            </button>
          </div>
        </div>

        <button class="text-xs font-mono text-ink-soft underline hover:text-ink" @click="clearFilters">
          Clear all filters
        </button>
      </aside>

      <!-- Results -->
      <div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <input
            v-model="query"
            type="search"
            placeholder="Search title, author, tag…"
            aria-label="Search books"
            class="flex-1 rounded-full border border-line bg-white px-4 py-2 text-sm min-w-[200px]"
          />
          <select v-model="sortBy" aria-label="Sort books" class="rounded-full border border-line bg-white px-4 py-2 text-sm cursor-pointer">
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">Sort: Highest rated</option>
            <option value="newest">Sort: Newest</option>
            <option value="title">Sort: Title A–Z</option>
          </select>
        </div>

        <p class="font-mono text-xs text-ink-soft mb-4">Showing {{ filteredBooks.length }} of {{ books.length }} books</p>

        <div v-if="filteredBooks.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <BookCard v-for="book in filteredBooks" :key="book.id" :book="book" />
        </div>
        <p v-else class="text-ink-soft text-[15px] mt-8">No books match your filters. Try clearing them.</p>
      </div>
    </div>
  </div>
</template>
