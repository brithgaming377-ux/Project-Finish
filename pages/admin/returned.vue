<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import {
  BookCheck,
  ArrowLeft,
  CalendarDays,
  Percent
} from '@lucide/vue'
const { books } = useCatalog()
const { requests } = useRequests()
const { getById } = useCatalog()

const returnedBooks = computed(() => {
  const returned = requests.value.filter(r => r.kind === 'borrow' && r.status === 'returned')
  return returned.map(req => ({
    ...req,
    book: getById(req.bookId)
  })).filter(r => r.book)
})

const returnedCount = computed(() => returnedBooks.value.length)
const thisWeekReturned = computed(() => {
  const weekAgo = new Date(Date.now() - 7 * 86400000)
  return returnedBooks.value.filter(r => new Date(r.processedOn || r.requestedOn) >= weekAgo).length
})
const activeLoans = computed(() => requests.value.filter(r => r.kind === 'borrow' && r.status === 'approved').length)
const returnRate = computed(() => {
  const total = requests.value.filter(r => r.kind === 'borrow' && (r.status === 'approved' || r.status === 'returned')).length
  return total > 0 ? Math.round((returnedCount.value / total) * 100) : 0
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div>
      <p class="text-sm text-slate-500">Circulation</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Returned Books</h1>
    </div>

    <section class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><BookCheck class="h-5 w-5" /></span>
          <div>
            <p class="text-sm text-slate-500">Total Returned</p>
            <p class="mt-1 text-3xl font-bold text-slate-900">{{ returnedCount }}</p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CalendarDays class="h-5 w-5" /></span>
          <div>
            <p class="text-sm text-slate-500">Returned This Week</p>
            <p class="mt-1 text-3xl font-bold text-slate-900">{{ thisWeekReturned }}</p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><Percent class="h-5 w-5" /></span>
          <div>
            <p class="text-sm text-slate-500">Return Rate</p>
            <p class="mt-1 text-3xl font-bold text-slate-900">{{ returnRate }}%</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="border-b border-slate-100 px-5 py-4">
        <h2 class="font-semibold text-slate-900">Return History</h2>
        <p class="mt-1 text-xs text-slate-500">Books that have been returned</p>
      </div>
      <div v-if="returnedBooks.length" class="divide-y divide-slate-100">
        <div v-for="item in returnedBooks" :key="item.id" class="flex items-center gap-3 px-5 py-3">
          <div class="h-10 w-7 rounded shrink-0" :style="{ background: item.book?.spineColor || '#ccc' }"></div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-800">{{ item.book?.title || 'Unknown' }}</p>
            <p class="text-xs text-slate-500">{{ item.userName }} · {{ item.userEmail }}</p>
          </div>
          <span class="text-xs text-slate-400">Returned {{ item.processedOn || item.requestedOn }}</span>
          <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Returned</span>
        </div>
      </div>
      <p v-else class="p-8 text-center text-sm text-slate-500">No books have been returned yet.</p>
    </section>
  </div>
</template>
