<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import {
  BookCheck,
  CalendarDays,
  Percent,
  Search,
  ChevronDown,
  Eye
} from '@lucide/vue'
import { getCoverUrl } from '~/data/books'
import BookCoverImage from '~/components/BookCoverImage.vue'

const { books, getById, refresh: refreshBooks } = useCatalog()
const { requests, refresh: refreshRequests } = useRequests()

onMounted(async () => {
  await Promise.allSettled([refreshBooks(), refreshRequests()])
})

const searchQuery = ref('')
const sortBy = ref<'return-date' | 'borrower' | 'book'>('return-date')
const selectedId = ref<number | null>(null)

const returnedBooks = computed(() => {
  const returned = requests.value.filter(r => r.kind === 'borrow' && r.status === 'returned')
  return returned.map(req => ({
    ...req,
    book: getById(req.bookId)
  })).filter(r => r.book)
})

const filteredReturnedBooks = computed(() => {
  let result = returnedBooks.value

  // Search filter
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    result = result.filter(item =>
      item.book?.title.toLowerCase().includes(q) ||
      item.userName.toLowerCase().includes(q) ||
      item.userEmail.toLowerCase().includes(q)
    )
  }

  // Sort
  return result.sort((a, b) => {
    switch (sortBy.value) {
      case 'book':
        return (a.book?.title || '').localeCompare(b.book?.title || '')
      case 'borrower':
        return a.userName.localeCompare(b.userName)
      case 'return-date':
      default:
        return new Date(b.processedOn || b.requestedOn).getTime() - new Date(a.processedOn || a.requestedOn).getTime()
    }
  })
})

const returnedCount = computed(() => returnedBooks.value.length)
const thisWeekReturned = computed(() => {
  const weekAgo = new Date(Date.now() - 7 * 86400000)
  return returnedBooks.value.filter(r => new Date(r.processedOn || r.requestedOn) >= weekAgo).length
})
const returnRate = computed(() => {
  const total = requests.value.filter(r => r.kind === 'borrow' && (r.status === 'approved' || r.status === 'returned')).length
  return total > 0 ? Math.round((returnedCount.value / total) * 100) : 0
})

function viewDetails(id: number) {
  selectedId.value = selectedId.value === id ? null : id
}

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
          <span class="text-slate-900 font-medium">Returned Books</span>
        </nav>
        <h1 class="font-display text-3xl font-semibold text-slate-900 tracking-tight">Returned Books</h1>
        <p class="text-sm text-slate-500 mt-2">View and manage all books that have been returned.</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><BookCheck class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Total</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ returnedCount }}</p>
        <p class="mt-1 text-xs text-slate-500">Books returned</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CalendarDays class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">This Week</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ thisWeekReturned }}</p>
        <p class="mt-1 text-xs text-slate-500">Returned this week</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><Percent class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Rate</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ returnRate }}%</p>
        <p class="mt-1 text-xs text-slate-500">Return rate</p>
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
            placeholder="Search book, borrower, email..."
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
            Sort: {{ { 'return-date': 'Return Date', 'book': 'Book', 'borrower': 'Borrower' }[sortBy] }}
            <ChevronDown class="h-4 w-4" />
          </button>
          <div class="absolute left-0 top-full mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
            <button
              v-for="option in [
                { value: 'return-date' as const, label: 'Return Date' },
                { value: 'book' as const, label: 'Book' },
                { value: 'borrower' as const, label: 'Borrower' }
              ]"
              :key="option.value"
              type="button"
              @click="sortBy = option.value"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50',
                sortBy === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700',
                option.value !== 'return-date' ? 'border-t border-slate-100' : ''
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Results count -->
        <div class="flex items-center px-3 py-2 text-sm text-slate-600">
          {{ filteredReturnedBooks.length }} item{{ filteredReturnedBooks.length !== 1 ? 's' : '' }}
        </div>
      </div>
    </section>

    <!-- Returned Books Table -->
    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div v-if="!filteredReturnedBooks.length" class="p-12 text-center">
        <BookCheck class="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p class="text-slate-500">No returned books found.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-200 bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Book</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Borrower</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Return Date</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-for="item in filteredReturnedBooks" :key="item.id">
              <tr class="hover:bg-slate-50 transition">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <BookCoverImage :src="item.book?.coverUrl" :fallback="getCoverUrl(item.book?.category || 'Other')" :alt="item.book?.title || 'Unknown Book'" :label="item.book?.title || 'Unknown Book'" class="h-10 w-7 shrink-0 overflow-hidden rounded" />
                    <p class="text-sm font-medium text-slate-900 truncate">{{ item.book?.title || 'Unknown Book' }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div>
                    <p class="font-medium text-slate-900">{{ item.userName }}</p>
                    <p class="text-xs text-slate-500">{{ item.userEmail }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 text-center text-sm font-medium text-slate-900">
                  {{ new Date(item.processedOn || item.requestedOn).toISOString().slice(0, 10) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    ✓ Returned
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    type="button"
                    @click="viewDetails(item.id)"
                    class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                    title="View details"
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                </td>
              </tr>
              <!-- Details Row -->
              <tr v-if="selectedId === item.id" class="bg-slate-50 border-b border-slate-100">
                <td colspan="5" class="px-6 py-4">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Book Information</p>
                      <p class="text-sm font-medium text-slate-900">{{ item.book?.title }}</p>
                      <p class="text-xs text-slate-600">Author: {{ item.book?.author }}</p>
                      <p class="text-xs text-slate-600">ISBN: {{ item.book?.isbn }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Borrower Details</p>
                      <p class="text-sm font-medium text-slate-900">{{ item.userName }}</p>
                      <p class="text-xs text-slate-600">{{ item.userEmail }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Return Information</p>
                      <p class="text-sm text-slate-900 font-medium">{{ new Date(item.processedOn || item.requestedOn).toISOString().slice(0, 10) }}</p>
                      <p class="text-xs text-emerald-600 font-semibold">Status: Returned</p>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
