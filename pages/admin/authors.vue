<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

import {
  Search,
  BookOpen,
  Star,
  ChevronDown
} from '@lucide/vue'

const { books } = useCatalog()

const searchQuery = ref('')
const sortBy = ref<'name' | 'books' | 'rating' | 'borrowed'>('books')

const authorStats = computed(() => {
  const stats: Record<string, { count: number; totalRating: number; borrowed: number }> = {}
  books.value.forEach((book) => {
    if (!stats[book.author]) {
      stats[book.author] = { count: 0, totalRating: 0, borrowed: 0 }
    }
    stats[book.author].count++
    stats[book.author].totalRating += book.rating
    stats[book.author].borrowed += book.availability.checkedOut
  })
  return Object.entries(stats)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgRating: data.count > 0 ? Math.round((data.totalRating / data.count) * 10) / 10 : 0,
      borrowed: data.borrowed
    }))
})

const filteredAuthors = computed(() => {
  let result = authorStats.value

  // Search filter
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    result = result.filter(author => author.name.toLowerCase().includes(q))
  }

  // Sort
  return result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return b.avgRating - a.avgRating
      case 'borrowed':
        return b.borrowed - a.borrowed
      case 'books':
      default:
        return b.count - a.count
    }
  })
})

const totalAuthors = computed(() => authorStats.value.length)
const topAuthor = computed(() => {
  const sorted = [...authorStats.value].sort((a, b) => b.count - a.count)
  return sorted[0]
})
const totalBooks = computed(() => books.value.length)
const avgRating = computed(() => {
  if (!books.value.length) return 0
  return Math.round((books.value.reduce((sum, b) => sum + b.rating, 0) / books.value.length) * 10) / 10
})

function clearSearch() {
  searchQuery.value = ''
}
</script>

<template>
  <div class="max-w-full mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <nav class="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <NuxtLink to="/admin" class="hover:text-slate-700 hover:underline font-medium">Admin</NuxtLink>
          <span class="text-slate-300">/</span>
          <span class="text-slate-900 font-medium">Authors</span>
        </nav>
        <h1 class="font-display text-3xl font-semibold text-slate-900 tracking-tight">Authors</h1>
        <p class="text-sm text-slate-500 mt-2">Browse and manage authors in your library collection.</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600"><BookOpen class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Total</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ totalAuthors }}</p>
        <p class="mt-1 text-xs text-slate-500">Authors</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><BookOpen class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Books</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ totalBooks }}</p>
        <p class="mt-1 text-xs text-slate-500">Total books</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600"><Star class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Top Author</span>
        </div>
        <p class="mt-3 text-sm font-bold text-slate-900 truncate">{{ topAuthor?.name || 'N/A' }}</p>
        <p class="mt-1 text-xs text-slate-500">{{ topAuthor?.count || 0 }} books</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Star class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Avg Rating</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ avgRating }}</p>
        <p class="mt-1 text-xs text-slate-500">out of 5.0</p>
      </article>
    </section>

    <!-- Search & Filters -->
    <section class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search authors..."
            class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          v-if="searchQuery"
          type="button"
          @click="clearSearch"
          class="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Clear
        </button>
      </div>

      <div class="flex flex-wrap gap-3">
        <!-- Sort By -->
        <div class="relative group">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Sort: {{ { name: 'Name', books: 'Books', rating: 'Rating', borrowed: 'Borrowed' }[sortBy] }}
            <ChevronDown class="h-4 w-4" />
          </button>
          <div class="absolute left-0 top-full mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
            <button
              v-for="option in [
                { value: 'books' as const, label: 'Books' },
                { value: 'name' as const, label: 'Name' },
                { value: 'rating' as const, label: 'Rating' },
                { value: 'borrowed' as const, label: 'Borrowed' }
              ]"
              :key="option.value"
              type="button"
              @click="sortBy = option.value"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50',
                sortBy === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700',
                option.value !== 'books' ? 'border-t border-slate-100' : ''
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Results count -->
        <div class="flex items-center px-3 py-2 text-sm text-slate-600">
          {{ filteredAuthors.length }} author{{ filteredAuthors.length !== 1 ? 's' : '' }}
        </div>
      </div>
    </section>

    <!-- Authors Table -->
    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div v-if="!filteredAuthors.length" class="p-12 text-center">
        <BookOpen class="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p class="text-slate-500">No authors found matching your search.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-200 bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Books</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Avg Rating</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Borrowed</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(author, index) in filteredAuthors" :key="author.name" class="hover:bg-slate-50 transition">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600 font-bold text-sm">
                    {{ author.name.charAt(0) }}
                  </div>
                  <p class="text-sm font-medium text-slate-900">{{ author.name }}</p>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {{ author.count }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <span class="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {{ author.avgRating }}
                  </span>
                  <Star class="h-3.5 w-3.5 text-amber-500" />
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {{ author.borrowed }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
