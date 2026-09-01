<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import {
  BookOpen,
  BookMarked,
  ShoppingCart,
  Clock,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Download
} from '@lucide/vue'
import { Doughnut, Bar } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const { books } = useCatalog()
const { requests } = useRequests()

const totalBooks = computed(() => books.value.length)
const totalBorrows = computed(() => requests.value.filter(r => r.kind === 'borrow').length)
const totalPurchases = computed(() => requests.value.filter(r => r.kind === 'purchase').length)
const activeLoans = computed(() => requests.value.filter(r => r.kind === 'borrow' && r.status === 'approved').length)
const pendingRequests = computed(() => requests.value.filter(r => r.status === 'pending').length)

const categoryData = computed(() => {
  const stats: Record<string, number> = {}
  books.value.forEach((book) => {
    stats[book.category] = (stats[book.category] || 0) + 1
  })
  return {
    labels: Object.keys(stats),
    datasets: [{
      data: Object.values(stats),
      backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'],
      borderWidth: 0
    }]
  }
})

const monthlyData = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const borrowData = months.map((_, i) => {
    return requests.value.filter(r => {
      const date = new Date(r.requestedOn)
      return r.kind === 'borrow' && date.getMonth() === i
    }).length
  })
  const purchaseData = months.map((_, i) => {
    return requests.value.filter(r => {
      const date = new Date(r.requestedOn)
      return r.kind === 'purchase' && date.getMonth() === i
    }).length
  })
  return {
    labels: months,
    datasets: [
      { label: 'Borrows', data: borrowData, backgroundColor: '#3b82f6' },
      { label: 'Purchases', data: purchaseData, backgroundColor: '#10b981' }
    ]
  }
})

const returnedCount = computed(() => requests.value.filter(r => r.kind === 'borrow' && r.status === 'returned').length)
const returnRate = computed(() => {
  const total = requests.value.filter(r => r.kind === 'borrow' && (r.status === 'approved' || r.status === 'returned')).length
  return total > 0 ? Math.round((returnedCount.value / total) * 100) : 0
})
const avgLoanDuration = computed(() => {
  const returned = requests.value.filter(r => r.kind === 'borrow' && r.status === 'returned' && r.processedOn)
  if (!returned.length) return 0
  const totalDays = returned.reduce((sum, r) => {
    const start = new Date(r.requestedOn)
    const end = new Date(r.processedOn!)
    return sum + Math.ceil((end.getTime() - start.getTime()) / 86400000)
  }, 0)
  return Math.round(totalDays / returned.length)
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } }
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' as const, labels: { boxWidth: 12, padding: 16 } } },
  scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1f5f9' } } }
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div>
      <p class="text-sm text-slate-500">Analytics</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Statistics</h1>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><BookOpen class="h-5 w-5" /></span>
        <div>
          <p class="text-sm text-slate-500">Total Books</p>
          <p class="mt-1 text-3xl font-bold text-slate-900">{{ totalBooks }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><BookMarked class="h-5 w-5" /></span>
        <div>
          <p class="text-sm text-slate-500">Total Borrows</p>
          <p class="mt-1 text-3xl font-bold text-blue-600">{{ totalBorrows }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><ShoppingCart class="h-5 w-5" /></span>
        <div>
          <p class="text-sm text-slate-500">Total Purchases</p>
          <p class="mt-1 text-3xl font-bold text-emerald-600">{{ totalPurchases }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Clock class="h-5 w-5" /></span>
        <div>
          <p class="text-sm text-slate-500">Active Loans</p>
          <p class="mt-1 text-3xl font-bold text-amber-600">{{ activeLoans }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><FileText class="h-5 w-5" /></span>
        <div>
          <p class="text-sm text-slate-500">Pending</p>
          <p class="mt-1 text-3xl font-bold text-violet-600">{{ pendingRequests }}</p>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="font-semibold text-slate-900">Collection by Category</h2>
        <p class="mt-1 text-xs text-slate-500">Book distribution</p>
        <div class="h-64 pt-4">
          <Doughnut :data="categoryData" :options="doughnutOptions" />
        </div>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="font-semibold text-slate-900">Monthly Activity</h2>
        <p class="mt-1 text-xs text-slate-500">Borrows and purchases</p>
        <div class="h-64 pt-4">
          <Bar :data="monthlyData" :options="barOptions" />
        </div>
      </article>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="font-semibold text-slate-900">Summary</h2>
      <p class="mt-1 text-xs text-slate-500">Library performance overview</p>
      <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg bg-blue-50 p-4">
          <p class="text-sm text-blue-600 font-medium">Active Loans</p>
          <p class="mt-1 text-xl font-bold text-slate-900">{{ activeLoans }}</p>
        </div>
        <div class="rounded-lg bg-emerald-50 p-4">
          <p class="text-sm text-emerald-600 font-medium">Avg Loan Duration</p>
          <p class="mt-1 text-xl font-bold text-slate-900">{{ avgLoanDuration }} days</p>
        </div>
        <div class="rounded-lg bg-amber-50 p-4">
          <p class="text-sm text-amber-600 font-medium">Return Rate</p>
          <p class="mt-1 text-xl font-bold text-slate-900">{{ returnRate }}%</p>
        </div>
        <div class="rounded-lg bg-violet-50 p-4">
          <p class="text-sm text-violet-600 font-medium">Total Requests</p>
          <p class="mt-1 text-xl font-bold text-slate-900">{{ requests.length }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
