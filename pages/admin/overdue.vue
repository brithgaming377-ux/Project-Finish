<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import {
  AlertTriangle,
  Clock,
  Gauge,
  Search,
  ChevronDown,
  RotateCcw,
  Eye
} from '@lucide/vue'
import { getCoverUrl } from '~/data/books'
import BookCoverImage from '~/components/BookCoverImage.vue'

const { books, updateBook } = useCatalog()
const { requests, updateStatus } = useRequests()
const { push: toast } = useToast()

const searchQuery = ref('')
const sortBy = ref<'overdue-days' | 'due-date' | 'borrower'>('overdue-days')
const selectedId = ref<number | null>(null)
const returningId = ref<number | null>(null)

const overdueBooks = computed(() => {
  const approvedBorrows = requests.value.filter(r => r.kind === 'borrow' && r.status === 'approved')
  const now = new Date()
  return approvedBorrows
    .map(req => {
      const dueDate = new Date((req.processedOn || req.requestedOn))
      dueDate.setDate(dueDate.getDate() + 14)
      const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / 86400000)
      return {
        ...req,
        book: books.value.find(b => b.id === req.bookId),
        dueDate: dueDate.toISOString().slice(0, 10),
        daysOverdue: daysOverdue > 0 ? daysOverdue : 0
      }
    })
    .filter(r => r.daysOverdue > 0 && r.book)
})

const filteredOverdueBooks = computed(() => {
  let result = overdueBooks.value

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
      case 'due-date':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case 'borrower':
        return a.userName.localeCompare(b.userName)
      case 'overdue-days':
      default:
        return b.daysOverdue - a.daysOverdue
    }
  })
})

const totalOverdue = computed(() => overdueBooks.value.length)
const maxOverdue = computed(() => overdueBooks.value[0]?.daysOverdue || 0)
const criticalOverdue = computed(() => overdueBooks.value.filter(r => r.daysOverdue > 7).length)

async function onReturnBook(requestId: number, bookId: number) {
  returningId.value = requestId
  try {
    updateStatus(requestId, 'returned')
    const book = books.value.find(b => b.id === bookId)
    if (book) {
      await updateBook(bookId, {
        availability: {
          ...book.availability,
          checkedOut: Math.max(0, book.availability.checkedOut - 1)
        }
      })
    }
    toast('Book returned successfully!', 'success')
  } catch (err: any) {
    toast('Failed to return book.', 'error')
  } finally {
    returningId.value = null
  }
}

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
          <span class="text-slate-900 font-medium">Overdue Books</span>
        </nav>
        <h1 class="font-display text-3xl font-semibold text-slate-900 tracking-tight">Overdue Books</h1>
        <p class="text-sm text-slate-500 mt-2">Books that are past their due date. Take action immediately.</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article class="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white"><AlertTriangle class="h-5 w-5" /></div>
          <span class="text-xs text-red-600 font-semibold">Total</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-red-600">{{ totalOverdue }}</p>
        <p class="mt-1 text-xs text-red-700">Books overdue</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Clock class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Max</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ maxOverdue }}</p>
        <p class="mt-1 text-xs text-slate-500">Days overdue</p>
      </article>
      <article class="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600 text-white"><Gauge class="h-5 w-5" /></div>
          <span class="text-xs text-amber-600 font-semibold">Critical</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-amber-600">{{ criticalOverdue }}</p>
        <p class="mt-1 text-xs text-amber-700">Over 7 days</p>
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
            Sort: {{ { 'overdue-days': 'Days Overdue', 'due-date': 'Due Date', 'borrower': 'Borrower' }[sortBy] }}
            <ChevronDown class="h-4 w-4" />
          </button>
          <div class="absolute left-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
            <button
              v-for="option in [
                { value: 'overdue-days' as const, label: 'Days Overdue' },
                { value: 'due-date' as const, label: 'Due Date' },
                { value: 'borrower' as const, label: 'Borrower' }
              ]"
              :key="option.value"
              type="button"
              @click="sortBy = option.value"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50',
                sortBy === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700',
                option.value !== 'overdue-days' ? 'border-t border-slate-100' : ''
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Results count -->
        <div class="flex items-center px-3 py-2 text-sm text-slate-600">
          {{ filteredOverdueBooks.length }} item{{ filteredOverdueBooks.length !== 1 ? 's' : '' }}
        </div>
      </div>
    </section>

    <!-- Overdue Books Table -->
    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div v-if="!filteredOverdueBooks.length" class="p-12 text-center">
        <AlertTriangle class="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p class="text-slate-500">No overdue books found.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-200 bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Book</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Borrower</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Due Date</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Days Overdue</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-for="item in filteredOverdueBooks" :key="item.id">
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
                <td class="px-6 py-4 text-center text-sm font-medium text-slate-900">{{ item.dueDate }}</td>
                <td class="px-6 py-4 text-center">
                  <span
                    :class="[
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border',
                      item.daysOverdue > 7
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    ]"
                  >
                    {{ item.daysOverdue }}d
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      @click="viewDetails(item.id)"
                      class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                      title="View details"
                    >
                      <Eye class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      @click="onReturnBook(item.id, item.bookId)"
                      :disabled="returningId === item.id"
                      class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 transition"
                      title="Return book"
                    >
                      <RotateCcw class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Details Row -->
              <tr v-if="selectedId === item.id" class="bg-slate-50 border-b border-slate-100">
                <td colspan="5" class="px-6 py-4">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Book Details</p>
                      <p class="text-sm font-medium text-slate-900">{{ item.book?.title }}</p>
                      <p class="text-xs text-slate-600">ISBN: {{ item.book?.isbn }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Due Date</p>
                      <p class="text-sm text-slate-900 font-medium">{{ item.dueDate }}</p>
                      <p class="text-sm text-red-600"><span class="font-medium">{{ item.daysOverdue }} days</span> overdue</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Action Required</p>
                      <button
                        type="button"
                        @click="onReturnBook(item.id, item.bookId)"
                        :disabled="returningId === item.id"
                        class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        <RotateCcw class="h-3.5 w-3.5" />
                        Return Book
                      </button>
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
