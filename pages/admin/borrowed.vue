<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

import {
  BookMarked,
  Clock,
  AlertCircle,
  RotateCcw,
  Search,
  Plus,
  Eye,
  ArrowLeft,
  Calendar,
  User,
  Filter,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from '@lucide/vue'
import type { Book } from '~/data/books'
import { getCoverUrl } from '~/data/books'
import BookCoverImage from '~/components/BookCoverImage.vue'

const router = useRouter()
const { books, refresh: refreshBooks, updateBook } = useCatalog()
const { requests, refresh: refreshRequests, updateStatus } = useRequests()
const { push: toast } = useToast()

onMounted(async () => {
  await Promise.allSettled([refreshBooks(), refreshRequests()])
})

const searchQuery = ref('')
const statusFilter = ref<'all' | 'borrowed' | 'due-soon' | 'overdue' | 'returned'>('borrowed')
const userFilter = ref<string | 'all'>('all')
const sortBy = ref<'due-date' | 'borrowed-date' | 'book-name'>('due-date')
const currentPage = ref(1)
const itemsPerPage = 20
const selectedRequestId = ref<number | null>(null)
const extendingId = ref<number | null>(null)
const returningId = ref<number | null>(null)
const extendDays = ref(14)
const showNewBorrowModal = ref(false)
const isSubmittingBorrow = ref(false)
const newBorrowForm = reactive({
  bookId: 0,
  userName: '',
  userEmail: ''
})

// Get all unique borrowers
const uniqueUsers = computed(() => {
  const users = new Set<string>()
  requests.value
    .filter(r => r.kind === 'borrow' && r.status === 'approved')
    .forEach(r => users.add(r.userName))
  return Array.from(users).sort()
})

// Compute borrow data with book info and calculated fields
const borrowDataWithBooks = computed(() => {
  return requests.value
    .filter(r => r.kind === 'borrow' && r.status === 'approved')
    .map(request => {
      const book = books.value.find(b => b.id === request.bookId)
      const borrowedDate = new Date(request.processedOn || request.requestedOn)
      const dueDate = new Date(borrowedDate)
      dueDate.setDate(dueDate.getDate() + 14)
      const now = new Date()
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const isOverdue = daysUntilDue < 0
      const isDueSoon = !isOverdue && daysUntilDue <= 3

      let status: 'borrowed' | 'due-soon' | 'overdue' = 'borrowed'
      if (isOverdue) status = 'overdue'
      else if (isDueSoon) status = 'due-soon'

      return {
        request,
        book,
        borrowedDate: borrowedDate.toISOString().slice(0, 10),
        dueDate: dueDate.toISOString().slice(0, 10),
        daysUntilDue,
        isOverdue,
        isDueSoon,
        status,
        fineDays: Math.max(0, Math.abs(daysUntilDue))
      }
    })
})

// Get returned books
const returnedBooks = computed(() => {
  return requests.value.filter(r => r.kind === 'borrow' && r.status === 'returned')
})

// Filter data
const filteredBorrowData = computed(() => {
  let result = borrowDataWithBooks.value

  // Status filter
  if (statusFilter.value !== 'all') {
    result = result.filter(item => item.status === statusFilter.value)
  }

  // User filter
  if (userFilter.value !== 'all') {
    result = result.filter(item => item.request.userName === userFilter.value)
  }

  // Search filter
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    result = result.filter(item =>
      item.book?.title.toLowerCase().includes(q) ||
      item.request.userName.toLowerCase().includes(q) ||
      item.book?.isbn?.toLowerCase().includes(q)
    )
  }

  // Sort
  return result.sort((a, b) => {
    switch (sortBy.value) {
      case 'borrowed-date':
        return new Date(b.borrowedDate).getTime() - new Date(a.borrowedDate).getTime()
      case 'book-name':
        return (a.book?.title || '').localeCompare(b.book?.title || '')
      case 'due-date':
      default:
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
  })
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredBorrowData.value.length / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredBorrowData.value.slice(start, start + itemsPerPage)
})

// Summary statistics
const borrowedCount = computed(() => borrowDataWithBooks.value.length)
const dueSoonCount = computed(() => borrowDataWithBooks.value.filter(item => item.isDueSoon).length)
const overdueCount = computed(() => borrowDataWithBooks.value.filter(item => item.isOverdue).length)
const returnedCount = computed(() => returnedBooks.value.length)

// Recent activity
const recentActivity = computed(() => {
  const activities: { type: 'borrow' | 'return' | 'overdue'; text: string; time: string }[] = []

  const allEvents = [
    ...borrowDataWithBooks.value.map(item => ({
      type: 'borrow' as const,
      date: new Date(item.borrowedDate),
      text: `${item.request.userName} borrowed "${item.book?.title || 'Unknown Book'}"`
    })),
    ...requests.value
      .filter(r => r.kind === 'borrow' && r.status === 'returned')
      .map(r => ({
        type: 'return' as const,
        date: new Date(r.processedOn || r.requestedOn),
        text: `${r.userName} returned "${books.value.find(b => b.id === r.bookId)?.title || 'Unknown Book'}"`
      })),
    ...borrowDataWithBooks.value
      .filter(item => item.isOverdue)
      .map(item => ({
        type: 'overdue' as const,
        date: new Date(),
        text: `${item.request.userName}'s "${item.book?.title || 'Unknown Book'}" is overdue by ${item.fineDays} day(s)`
      }))
  ]

  return allEvents
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6)
    .map(event => ({
      ...event,
      time: formatTime(event.date)
    }))
})

function formatTime(date: Date): string {
  const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (daysAgo === 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo < 7) return `${daysAgo} days ago`
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`
  return `${Math.floor(daysAgo / 30)} months ago`
}

function getDaysUntilDueColor(daysUntilDue: number): string {
  if (daysUntilDue < 0) return 'bg-red-50 text-red-700 border-red-200'
  if (daysUntilDue <= 3) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

function getDaysUntilDueIcon(daysUntilDue: number) {
  if (daysUntilDue < 0) return '🔴'
  if (daysUntilDue <= 3) return '🟡'
  return '🟢'
}

async function onReturnBook(requestId: number, bookId: number) {
  returningId.value = requestId
  try {
    await updateStatus(requestId, 'returned')
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

function onExtendDueDate(requestId: number, bookId: number, currentDueDate: string) {
  extendingId.value = requestId
  const dueDate = new Date(currentDueDate)
  dueDate.setDate(dueDate.getDate() + extendDays.value)
  toast(`Due date extended to ${dueDate.toISOString().slice(0, 10)}`, 'success')
  extendingId.value = null
  extendDays.value = 14
}

function exportToCSV() {
  const rows = [
    ['Book', 'Borrower', 'Borrowed Date', 'Due Date', 'Days Until Due', 'Status']
  ]

  filteredBorrowData.value.forEach(item => {
    rows.push([
      item.book?.title || 'Unknown',
      item.request.userName,
      item.borrowedDate,
      item.dueDate,
      String(item.daysUntilDue),
      item.status
    ])
  })

  const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `borrowed-books-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast('Report exported successfully!', 'success')
}

function goToNewBorrow() {
  showNewBorrowModal.value = true
  newBorrowForm.bookId = 0
  newBorrowForm.userName = ''
  newBorrowForm.userEmail = ''
}

async function submitNewBorrow() {
  if (!newBorrowForm.bookId || !newBorrowForm.userName.trim() || !newBorrowForm.userEmail.trim()) {
    toast('Please fill in all fields.', 'error')
    return
  }

  if (!newBorrowForm.userEmail.includes('@')) {
    toast('Please enter a valid email address.', 'error')
    return
  }

  isSubmittingBorrow.value = true
  try {
    const { submit } = useRequests()
    const success = await submit('borrow', newBorrowForm.bookId, newBorrowForm.userName.trim(), newBorrowForm.userEmail.trim())
    
    if (!success) {
      toast('This borrow request already exists.', 'error')
      return
    }

    // Update book availability
    const book = books.value.find(b => b.id === newBorrowForm.bookId)
    if (book) {
      await updateBook(book.id, {
        availability: {
          ...book.availability,
          checkedOut: book.availability.checkedOut + 1
        }
      })
    }

    // Mark as approved immediately (admin action)
    const requests_ = useRequests()
    const lastRequest = requests_.requests.value[0]
    if (lastRequest && lastRequest.bookId === newBorrowForm.bookId && lastRequest.userEmail === newBorrowForm.userEmail) {
      await requests_.updateStatus(lastRequest.id, 'approved')
    }

    toast(`Borrow record created for ${newBorrowForm.userName}!`, 'success')
    showNewBorrowModal.value = false
  } catch (err: any) {
    toast('Failed to create borrow record.', 'error')
  } finally {
    isSubmittingBorrow.value = false
  }
}

function closeNewBorrowModal() {
  showNewBorrowModal.value = false
}

function viewDetails(requestId: number) {
  selectedRequestId.value = selectedRequestId.value === requestId ? null : requestId
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
          <span class="text-slate-900 font-medium">Borrowed Books</span>
        </nav>
        <h1 class="font-display text-3xl font-semibold text-slate-900 tracking-tight">Borrowed Books</h1>
        <p class="text-sm text-slate-500 mt-2">Manage currently borrowed books and borrowing records.</p>
      </div>
      <button
        type="button"
        @click="goToNewBorrow"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
      >
        <Plus class="h-4 w-4" />
        New Borrow
      </button>
    </div>

    <!-- Summary Cards -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><BookMarked class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Total</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ borrowedCount }}</p>
        <p class="mt-1 text-xs text-slate-500">Currently borrowed</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Clock class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Due Soon</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ dueSoonCount }}</p>
        <p class="mt-1 text-xs text-slate-500">Due within 3 days</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600"><AlertCircle class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Overdue</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ overdueCount }}</p>
        <p class="mt-1 text-xs text-slate-500">Past due date</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><RotateCcw class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Returned</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ returnedCount }}</p>
        <p class="mt-1 text-xs text-slate-500">Books returned</p>
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
            placeholder="Search book, member, ISBN..."
            class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="button"
          @click="exportToCSV"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <Download class="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div class="flex flex-wrap gap-3">
        <!-- Status Filter -->
        <div class="relative group">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Filter class="h-4 w-4" />
            Status
            <ChevronDown class="h-4 w-4" />
          </button>
          <div class="absolute left-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
            <button
              v-for="option in [
                { value: 'all' as const, label: 'All Status' },
                { value: 'borrowed' as const, label: 'Borrowed' },
                { value: 'due-soon' as const, label: 'Due Soon' },
                { value: 'overdue' as const, label: 'Overdue' },
                { value: 'returned' as const, label: 'Returned' }
              ]"
              :key="option.value"
              type="button"
              @click="statusFilter = option.value; currentPage = 1"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50',
                statusFilter === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700',
                option.value !== 'all' ? 'border-t border-slate-100' : ''
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- User Filter -->
        <div class="relative group">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <User class="h-4 w-4" />
            Borrower
            <ChevronDown class="h-4 w-4" />
          </button>
          <div class="absolute left-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition max-h-64 overflow-y-auto">
            <button
              type="button"
              @click="userFilter = 'all'; currentPage = 1"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50',
                userFilter === 'all' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
              ]"
            >
              All Users
            </button>
            <button
              v-for="user in uniqueUsers"
              :key="user"
              type="button"
              @click="userFilter = user; currentPage = 1"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 border-t border-slate-100',
                userFilter === user ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
              ]"
            >
              {{ user }}
            </button>
          </div>
        </div>

        <!-- Sort By -->
        <div class="relative group">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Sort: {{ { 'due-date': 'Due Date', 'borrowed-date': 'Borrowed Date', 'book-name': 'Book Name' }[sortBy] }}
            <ChevronDown class="h-4 w-4" />
          </button>
          <div class="absolute left-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
            <button
              v-for="option in [
                { value: 'due-date' as const, label: 'Due Date' },
                { value: 'borrowed-date' as const, label: 'Borrowed Date' },
                { value: 'book-name' as const, label: 'Book Name' }
              ]"
              :key="option.value"
              type="button"
              @click="sortBy = option.value"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50',
                sortBy === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700',
                option.value !== 'due-date' ? 'border-t border-slate-100' : ''
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Results count -->
        <div class="flex items-center px-3 py-2 text-sm text-slate-600">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredBorrowData.length) }} of {{ filteredBorrowData.length }}
        </div>
      </div>
    </section>

    <!-- Borrowed Books Table -->
    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div v-if="!filteredBorrowData.length" class="p-12 text-center">
        <BookMarked class="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p class="text-slate-500">No borrowed books found.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-200 bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Book</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Borrower</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Borrowed</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Due</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-for="item in paginatedData" :key="item.request.id">
              <tr class="hover:bg-slate-50 transition">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <BookCoverImage :src="item.book?.coverUrl" :fallback="getCoverUrl(item.book?.category || 'Other')" :alt="item.book?.title || 'Unknown Book'" :label="item.book?.title || 'Unknown Book'" class="h-10 w-7 shrink-0 overflow-hidden rounded" />
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-slate-900 truncate">{{ item.book?.title || 'Unknown Book' }}</p>
                      <p class="text-xs text-slate-500">{{ item.book?.author || 'Unknown Author' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">
                  <div>
                    <p class="font-medium text-slate-900">{{ item.request.userName }}</p>
                    <p class="text-xs text-slate-500">{{ item.request.userEmail }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 text-center text-sm text-slate-600">{{ item.borrowedDate }}</td>
                <td class="px-6 py-4 text-center text-sm font-medium text-slate-900">{{ item.dueDate }}</td>
                <td class="px-6 py-4 text-center">
                  <span
                    :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border', getDaysUntilDueColor(item.daysUntilDue)]"
                  >
                    {{ getDaysUntilDueIcon(item.daysUntilDue) }}
                    {{ item.status === 'overdue' ? `${item.fineDays}d overdue` : item.status === 'due-soon' ? `${item.daysUntilDue}d left` : 'On time' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      @click="viewDetails(item.request.id)"
                      class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                      title="View details"
                    >
                      <Eye class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      @click="onReturnBook(item.request.id, item.request.bookId)"
                      :disabled="returningId === item.request.id"
                      class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 transition"
                      title="Return book"
                    >
                      <RotateCcw class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Details Row -->
              <tr v-if="selectedRequestId === item.request.id" class="bg-slate-50 border-b border-slate-100">
                <td colspan="6" class="px-6 py-4">
                  <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Book Details</p>
                        <p class="text-sm font-medium text-slate-900">{{ item.book?.title }}</p>
                        <p class="text-xs text-slate-600">ISBN: {{ item.book?.isbn }}</p>
                        <p class="text-xs text-slate-600">Category: {{ item.book?.category }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Timeline</p>
                        <p class="text-sm text-slate-900"><span class="font-medium">Borrowed:</span> {{ item.borrowedDate }}</p>
                        <p class="text-sm text-slate-900"><span class="font-medium">Due:</span> {{ item.dueDate }}</p>
                        <p v-if="item.isOverdue" class="text-sm text-red-600"><span class="font-medium">Overdue by:</span> {{ item.fineDays }} day(s)</p>
                      </div>
                      <div class="flex flex-col gap-2">
                        <p class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Actions</p>
                        <div class="flex gap-2">
                          <button
                            type="button"
                            @click="onExtendDueDate(item.request.id, item.request.bookId, item.dueDate)"
                            :disabled="extendingId === item.request.id"
                            class="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 transition"
                          >
                            <Calendar class="h-3.5 w-3.5" />
                            Extend
                          </button>
                          <button
                            type="button"
                            @click="onReturnBook(item.request.id, item.request.bookId)"
                            :disabled="returningId === item.request.id"
                            class="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                          >
                            <RotateCcw class="h-3.5 w-3.5" />
                            Return
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
        <div class="text-sm text-slate-600">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <ChevronLeft class="h-4 w-4" />
          </button>
          <div class="flex gap-1">
            <button
              v-for="page in Array.from({ length: totalPages }, (_, i) => i + 1)"
              :key="page"
              type="button"
              @click="currentPage = page"
              :class="[
                'rounded-lg px-3 py-2 text-sm font-medium transition',
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              ]"
            >
              {{ page }}
            </button>
          </div>
          <button
            type="button"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>

    <!-- Recent Activity -->
    <section class="grid gap-6 lg:grid-cols-2">
      <article class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="border-b border-slate-100 px-5 py-4">
          <h2 class="font-semibold text-slate-900">Recent Activity</h2>
          <p class="mt-1 text-xs text-slate-500">Latest borrow and return events</p>
        </div>
        <div v-if="recentActivity.length" class="divide-y divide-slate-100">
          <div v-for="(activity, i) in recentActivity" :key="i" class="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
            <span
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              :class="activity.type === 'borrow' ? 'bg-blue-50 text-blue-600' : activity.type === 'return' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'"
            >
              <BookMarked v-if="activity.type === 'borrow'" class="h-4 w-4" aria-hidden="true" />
              <RotateCcw v-else-if="activity.type === 'return'" class="h-4 w-4" aria-hidden="true" />
              <AlertCircle v-else class="h-4 w-4" aria-hidden="true" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-slate-700">{{ activity.text }}</p>
              <p class="text-xs text-slate-400">{{ activity.time }}</p>
            </div>
          </div>
        </div>
        <p v-else class="p-8 text-center text-sm text-slate-500">No recent activity.</p>
      </article>

      <!-- Quick Stats -->
      <article class="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 class="font-semibold text-slate-900 mb-4">Quick Stats</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <span class="text-sm text-slate-600">Average borrow duration</span>
            <span class="font-semibold text-slate-900">14 days</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <span class="text-sm text-slate-600">Total active borrows</span>
            <span class="font-semibold text-slate-900">{{ borrowedCount }}</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-red-50">
            <span class="text-sm text-red-700 font-medium">Overdue books</span>
            <span class="font-semibold text-red-700">{{ overdueCount }}</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-amber-50">
            <span class="text-sm text-amber-700 font-medium">Due soon (3 days)</span>
            <span class="font-semibold text-amber-700">{{ dueSoonCount }}</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
            <span class="text-sm text-emerald-700 font-medium">Books returned</span>
            <span class="font-semibold text-emerald-700">{{ returnedCount }}</span>
          </div>
        </div>
      </article>
    </section>

    <!-- New Borrow Modal -->
    <Teleport to="body">
      <div
        v-if="showNewBorrowModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="closeNewBorrowModal"
      >
        <div class="rounded-xl border border-slate-200 bg-white shadow-xl p-6 max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Plus class="h-5 w-5" />
            </div>
            <h2 class="text-lg font-semibold text-slate-900">Create New Borrow</h2>
          </div>
          <p class="text-sm text-slate-600 mb-6">Register a new book borrow record.</p>

          <form @submit.prevent="submitNewBorrow" class="space-y-4">
            <!-- Book Selection -->
            <div>
              <label class="block text-sm font-semibold text-slate-900 mb-2">Select Book</label>
              <select
                v-model.number="newBorrowForm.bookId"
                class="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option :value="0">-- Choose a book --</option>
                <option
                  v-for="book in books.filter(b => b.availability.checkedOut < b.availability.digitalCopies)"
                  :key="book.id"
                  :value="book.id"
                >
                  {{ book.title }} ({{ book.availability.digitalCopies - book.availability.checkedOut }} available)
                </option>
              </select>
            </div>

            <!-- Borrower Name -->
            <div>
              <label class="block text-sm font-semibold text-slate-900 mb-2">Borrower Name</label>
              <input
                v-model="newBorrowForm.userName"
                type="text"
                placeholder="Enter member name..."
                class="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <!-- Borrower Email -->
            <div>
              <label class="block text-sm font-semibold text-slate-900 mb-2">Borrower Email</label>
              <input
                v-model="newBorrowForm.userEmail"
                type="email"
                placeholder="Enter member email..."
                class="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <!-- Info Message -->
            <div class="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p class="text-xs text-blue-700">
                <span class="font-semibold">Note:</span> This borrow will be created with a 14-day due date and automatically approved.
              </p>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeNewBorrowModal"
                class="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmittingBorrow"
                class="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {{ isSubmittingBorrow ? 'Creating...' : 'Create Borrow' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
