<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import { Doughnut, Line } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

import {
  BookOpen,
  BookCheck,
  RefreshCw,
  Users,
  Clock,
  Sparkles,
  Heart,
  Star,
  Search,
  UserPlus,
  BookMarked,
  RotateCcw,
  TrendingUp,
} from '@lucide/vue'
import { getCoverUrl } from '~/data/books'

const { books, updateBook } = useCatalog()
const { requests, pending, updateStatus } = useRequests()
const { push: toast } = useToast()
const { state: libraryState } = useLibrary()
const { user } = useAuth()

const searchQuery = ref('')
const activityFilter = ref<'7d' | '30d' | '1y'>('7d')
const totalUsers = ref(0)
const adminCount = ref(0)
const readerCount = ref(0)

async function fetchUserCount() {
  try {
    const result = await $fetch('/api/accounts', { query: { email: user.value?.email } }) as any
    const accounts = result.accounts || []
    totalUsers.value = accounts.length
    adminCount.value = accounts.filter((a: any) => a.role === 'admin' || a.role === 'super-admin').length
    readerCount.value = accounts.filter((a: any) => a.role === 'user').length
  } catch {
    totalUsers.value = 0
    adminCount.value = 0
    readerCount.value = 0
  }
}

onMounted(() => {
  fetchUserCount()
})

// Pre-compute book lookup map to avoid O(n) find() in loops
const bookMap = computed(() => {
  const map = new Map<number, typeof books.value[0]>()
  books.value.forEach(b => map.set(b.id, b))
  return map
})

// Single pass computation for all book stats
const bookStats = computed(() => {
  let totalCopies = 0
  let availableCopies = 0
  let borrowedCopies = 0
  const categoryStats: Record<string, number> = {}
  let mostPopularBook: typeof books.value[0] | null = null
  let maxRatings = -1

  for (const book of books.value) {
    totalCopies += book.availability.digitalCopies
    availableCopies += Math.max(book.availability.digitalCopies - book.availability.checkedOut, 0)
    borrowedCopies += book.availability.checkedOut
    categoryStats[book.category] = (categoryStats[book.category] || 0) + 1
    if (book.ratingsCount > maxRatings) {
      maxRatings = book.ratingsCount
      mostPopularBook = book
    }
  }

  return { totalCopies, availableCopies, borrowedCopies, categoryStats, mostPopularBook }
})

const totalBooks = computed(() => books.value.length)
const totalCopies = computed(() => bookStats.value.totalCopies)
const availableCopies = computed(() => bookStats.value.availableCopies)
const borrowedCopies = computed(() => bookStats.value.borrowedCopies)
const mostPopularBook = computed(() => bookStats.value.mostPopularBook)
const favoriteCount = computed(() => libraryState.value.saved.length)

const newBooks = computed(() => {
  const thirtyDaysAgo = Date.now() - 30 * 86400000
  return books.value.filter(book => new Date(book.addedDate).getTime() >= thirtyDaysAgo)
})

const overdueBooks = computed(() => {
  const now = Date.now()
  return requests.value
    .filter(r => r.kind === 'borrow' && r.status === 'approved')
    .map(req => {
      const dueDate = new Date(req.processedOn || req.requestedOn)
      dueDate.setDate(dueDate.getDate() + 14)
      const daysOverdue = Math.ceil((now - dueDate.getTime()) / 86400000)
      return { ...req, book: bookMap.value.get(req.bookId), dueDate: dueDate.toISOString().slice(0, 10), daysOverdue: daysOverdue > 0 ? daysOverdue : 0 }
    })
    .filter(r => r.daysOverdue > 0 && r.book)
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
})

// Category Chart
const categoryChartData = computed(() => {
  const stats = bookStats.value.categoryStats
  return {
    labels: Object.keys(stats),
    datasets: [{
      data: Object.values(stats),
      backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'],
      borderWidth: 0
    }]
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } }
}

// Activity Chart
const chartLabels = computed(() => {
  if (activityFilter.value === '7d') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  if (activityFilter.value === '30d') return ['Week 1', 'Week 2', 'Week 3', 'Week 4']
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
})

const chartData = computed(() => {
  const labels = chartLabels.value
  const is7d = activityFilter.value === '7d'
  const is30d = activityFilter.value === '30d'

  const borrowData = labels.map((_, i) => {
    return requests.value.filter(r => {
      if (r.kind !== 'borrow') return false
      const d = new Date(r.requestedOn)
      if (is7d) return (new Date().getDay() + i) % 7 === d.getDay()
      if (is30d) return Math.floor(d.getDate() / 7) === i
      return d.getMonth() === i
    }).length
  })

  const returnData = labels.map((_, i) => {
    return requests.value.filter(r => {
      if (r.kind !== 'borrow' || r.status !== 'returned') return false
      const d = new Date(r.processedOn || r.requestedOn)
      if (is7d) return (new Date().getDay() + i) % 7 === d.getDay()
      if (is30d) return Math.floor(d.getDate() / 7) === i
      return d.getMonth() === i
    }).length
  })

  return {
    labels,
    datasets: [
      { label: 'Borrowed', data: borrowData, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 3 },
      { label: 'Returned', data: returnData, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, pointRadius: 3 }
    ]
  }
})

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' as const, labels: { boxWidth: 12, padding: 16, font: { size: 11 } } } },
  scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1f5f9' } } }
}

// Popular Books - single pass for borrow counts
const popularBooks = computed(() => {
  const borrowCounts = new Map<number, number>()
  for (const r of requests.value) {
    if (r.kind === 'borrow' && r.status === 'approved') {
      borrowCounts.set(r.bookId, (borrowCounts.get(r.bookId) || 0) + 1)
    }
  }
  return [...books.value]
    .sort((a, b) => b.ratingsCount - a.ratingsCount)
    .slice(0, 5)
    .map((book, i) => ({
      id: book.id,
      rank: i + 1,
      title: book.title,
      author: book.author,
      category: book.category,
      coverUrl: book.coverUrl,
      views: book.ratingsCount * 10,
      borrows: borrowCounts.get(book.id) || 0
    }))
})

const recentlyAdded = computed(() => {
  return [...books.value]
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, 5)
})

const recentActivity = computed(() => {
  const activities: { icon: typeof UserPlus; text: string; time: string; type: string }[] = []

  for (const req of requests.value.slice(0, 10)) {
    const daysAgo = Math.floor((Date.now() - new Date(req.requestedOn).getTime()) / 86400000)
    const time = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`
    const bookTitle = bookMap.value.get(req.bookId)?.title || 'Unknown'

    if (req.kind === 'borrow' && req.status === 'pending') {
      activities.push({ icon: UserPlus, text: `${req.userName} requested to borrow "${bookTitle}"`, time, type: 'request' })
    } else if (req.kind === 'borrow' && req.status === 'approved') {
      activities.push({ icon: BookMarked, text: `${req.userName} borrowed "${bookTitle}"`, time, type: 'borrow' })
    } else if (req.kind === 'borrow' && req.status === 'returned') {
      activities.push({ icon: RotateCcw, text: `${req.userName} returned "${bookTitle}"`, time, type: 'return' })
    }
  }

  for (const book of recentlyAdded.value.slice(0, 3)) {
    const daysAgo = Math.floor((Date.now() - new Date(book.addedDate).getTime()) / 86400000)
    const time = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`
    activities.push({ icon: BookOpen, text: `"${book.title}" was added to library`, time, type: 'new' })
  }

  return activities.slice(0, 8)
})

async function processRequest(id: number, decision: 'approved' | 'declined') {
  const request = pending.value.find(item => item.id === id)
  if (!request) return
  const book = bookMap.value.get(request.bookId)
  if (decision === 'approved' && request.kind === 'borrow') {
    if (!book || book.availability.checkedOut >= book.availability.digitalCopies) return toast('This book no longer has an available copy.', 'error')
    await updateBook(book.id, { availability: { ...book.availability, checkedOut: book.availability.checkedOut + 1 } })
  }
  updateStatus(id, decision)
  toast(`Borrow request ${decision}.`)
}

function onSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/admin/books?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm text-slate-500">Library Management</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">E-Library Dashboard</h1>
      </div>
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        System Online
      </div>
    </div>

    <!-- Search Bar -->
    <form class="flex gap-2" @submit.prevent="onSearch">
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search books, authors, categories, ISBN..."
          class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <button type="submit" class="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
        Search
      </button>
    </form>

    <!-- Summary Cards -->
    <section class="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><BookOpen class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Total</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ totalBooks.toLocaleString() }}</p>
        <p class="mt-1 text-xs text-slate-500">Books in library</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><BookCheck class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Available</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ availableCopies.toLocaleString() }}</p>
        <p class="mt-1 text-xs text-slate-500">Copies available</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><RefreshCw class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Borrowed</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ borrowedCopies.toLocaleString() }}</p>
        <p class="mt-1 text-xs text-slate-500">Copies on loan</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><Users class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Users</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ totalUsers.toLocaleString() }}</p>
        <p class="mt-1 text-xs text-slate-500">{{ adminCount }} admins · {{ readerCount }} readers</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600"><Clock class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Overdue</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ overdueBooks.length }}</p>
        <p class="mt-1 text-xs text-slate-500">Need attention</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600"><Sparkles class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">New</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ newBooks.length }}</p>
        <p class="mt-1 text-xs text-slate-500">Added this month</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 text-pink-600"><Heart class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Saved</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ favoriteCount }}</p>
        <p class="mt-1 text-xs text-slate-500">Favorited books</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600"><Star class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Popular</span>
        </div>
        <p class="mt-3 text-lg font-bold text-slate-900 truncate">{{ mostPopularBook?.title || 'N/A' }}</p>
        <p class="mt-1 text-xs text-slate-500">Most popular book</p>
      </article>
    </section>

    <!-- Charts Row -->
    <section class="grid gap-6 lg:grid-cols-3">
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <div class="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 class="font-semibold text-slate-900">Library Activity</h2>
            <p class="mt-1 text-xs text-slate-500">Books borrowed and returned</p>
          </div>
          <div class="flex gap-1 rounded-lg bg-slate-100 p-1">
            <button
              v-for="filter in [{ key: '7d', label: '7 Days' }, { key: '30d', label: '30 Days' }, { key: '1y', label: 'Year' }]"
              :key="filter.key"
              class="rounded-md px-3 py-1.5 text-xs font-medium transition"
              :class="activityFilter === filter.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
              @click="activityFilter = filter.key as any"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
        <div class="h-64">
          <Line :data="chartData" :options="lineOptions" />
        </div>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="font-semibold text-slate-900">Book Collection</h2>
        <p class="mt-1 text-xs text-slate-500">By category</p>
        <div class="h-56 pt-4">
          <Doughnut :data="categoryChartData" :options="doughnutOptions" />
        </div>
      </article>
    </section>

    <!-- Popular & Recent -->
    <section class="grid gap-6 lg:grid-cols-2">
      <article class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="border-b border-slate-100 px-5 py-4">
          <h2 class="font-semibold text-slate-900">Popular Books</h2>
          <p class="mt-1 text-xs text-slate-500">Most viewed and borrowed</p>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="book in popularBooks" :key="book.rank" class="flex items-center gap-3 px-5 py-3">
            <BookCoverImage :src="book.coverUrl" :fallback="getCoverUrl(book.category)" :alt="book.title" :label="book.title" class="h-12 w-9 shrink-0 overflow-hidden rounded" />
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-600">#{{ book.rank }}</span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-800 truncate">{{ book.title }}</p>
              <p class="text-xs text-slate-500">{{ book.author }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-700">{{ book.views }}</p>
              <p class="text-xs text-slate-400">views</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-emerald-600">{{ book.borrows }}</p>
              <p class="text-xs text-slate-400">borrows</p>
            </div>
          </div>
        </div>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 class="font-semibold text-slate-900">Recently Added</h2>
            <p class="mt-1 text-xs text-slate-500">Newest books in library</p>
          </div>
          <NuxtLink to="/admin/books" class="text-xs font-semibold text-blue-600 hover:underline">View all</NuxtLink>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="book in recentlyAdded" :key="book.id" class="flex items-center gap-3 px-5 py-3">
            <BookCoverImage :src="book.coverUrl" :fallback="getCoverUrl(book.category)" :alt="book.title" :label="book.title" class="h-12 w-9 shrink-0 overflow-hidden rounded" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-800 truncate">{{ book.title }}</p>
              <p class="text-xs text-slate-500">{{ book.author }} · {{ book.category }}</p>
            </div>
            <span class="text-xs text-slate-400">{{ book.addedDate }}</span>
          </div>
        </div>
      </article>
    </section>

    <!-- Recent Activity & Overdue -->
    <section class="grid gap-6 lg:grid-cols-2">
      <article class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="border-b border-slate-100 px-5 py-4">
          <h2 class="font-semibold text-slate-900">Recent Activity</h2>
          <p class="mt-1 text-xs text-slate-500">Latest library events</p>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="(activity, i) in recentActivity" :key="i" class="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              :class="{
                'bg-blue-50 text-blue-600': activity.type === 'request',
                'bg-amber-50 text-amber-600': activity.type === 'borrow',
                'bg-emerald-50 text-emerald-600': activity.type === 'return',
                'bg-violet-50 text-violet-600': activity.type === 'new'
              }"
            ><component :is="activity.icon" class="h-4 w-4" aria-hidden="true" /></span>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-slate-700">{{ activity.text }}</p>
              <p class="text-xs text-slate-400">{{ activity.time }}</p>
            </div>
          </div>
          <p v-if="!recentActivity.length" class="p-8 text-center text-sm text-slate-500">No recent activity.</p>
        </div>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 class="font-semibold text-slate-900">Overdue Books</h2>
            <p class="mt-1 text-xs text-slate-500">Books past due date</p>
          </div>
          <span class="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">{{ overdueBooks.length }} overdue</span>
        </div>
        <div v-if="overdueBooks.length" class="divide-y divide-slate-100">
          <div v-for="item in overdueBooks.slice(0, 5)" :key="item.id" class="flex items-center gap-3 px-5 py-3">
            <BookCoverImage v-if="item.book" :src="item.book.coverUrl" :fallback="getCoverUrl(item.book.category)" :alt="item.book.title" :label="item.book.title" class="h-12 w-9 shrink-0 overflow-hidden rounded" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-800 truncate">{{ item.book?.title || 'Unknown' }}</p>
              <p class="text-xs text-slate-500">{{ item.userName }} · Due {{ item.dueDate }}</p>
            </div>
            <span class="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">{{ item.daysOverdue }}d</span>
          </div>
        </div>
        <p v-else class="p-8 text-center text-sm text-slate-500">No overdue books.</p>
      </article>
    </section>

    <!-- Pending Requests -->
    <section v-if="pending.length" class="rounded-xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between border-b border-amber-100 px-5 py-4">
        <div>
          <h2 class="font-semibold text-slate-900">Pending Requests</h2>
          <p class="mt-1 text-xs text-slate-500">Approve or decline reader requests</p>
        </div>
        <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{{ pending.length }} pending</span>
      </div>
      <div class="divide-y divide-amber-100">
        <div v-for="request in pending" :key="request.id" class="flex flex-wrap items-center gap-3 px-5 py-4">
          <BookCoverImage v-if="bookMap.get(request.bookId)" :src="bookMap.get(request.bookId)?.coverUrl" :fallback="getCoverUrl(bookMap.get(request.bookId)!.category)" :alt="bookMap.get(request.bookId)!.title" :label="bookMap.get(request.bookId)!.title" class="h-12 w-9 shrink-0 overflow-hidden rounded" />
          <span v-else class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <BookMarked v-if="request.kind === 'borrow'" class="h-4 w-4" />
            <TrendingUp v-else class="h-4 w-4" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-800">{{ request.userName }} <span class="font-normal text-slate-500">requested to {{ request.kind }}</span></p>
            <p class="truncate text-xs text-slate-500">{{ bookMap.get(request.bookId)?.title || 'Removed book' }} · {{ request.userEmail }}</p>
          </div>
          <span class="text-xs text-slate-400">{{ request.requestedOn }}</span>
          <button type="button" class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700" @click="processRequest(request.id, 'approved')">Approve</button>
          <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white" @click="processRequest(request.id, 'declined')">Decline</button>
        </div>
      </div>
    </section>
  </div>
</template>
