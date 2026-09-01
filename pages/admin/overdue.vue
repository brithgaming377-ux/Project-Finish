<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import {
  AlertTriangle,
  Clock,
  Gauge
} from '@lucide/vue'
const { books } = useCatalog()
const { requests } = useRequests()

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
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
})

const totalOverdue = computed(() => overdueBooks.value.length)
const maxOverdue = computed(() => overdueBooks.value[0]?.daysOverdue || 0)
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div>
      <p class="text-sm text-slate-500">Circulation</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Overdue Books</h1>
    </div>

    <section class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600"><AlertTriangle class="h-5 w-5" /></span>
          <div>
            <p class="text-sm text-slate-500">Total Overdue</p>
            <p class="mt-1 text-3xl font-bold text-red-600">{{ totalOverdue }}</p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Clock class="h-5 w-5" /></span>
          <div>
            <p class="text-sm text-slate-500">Max Days Overdue</p>
            <p class="mt-1 text-3xl font-bold text-slate-900">{{ maxOverdue }} <span class="text-sm font-normal text-slate-500">days</span></p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Gauge class="h-5 w-5" /></span>
          <div>
            <p class="text-sm text-slate-500">Need Action</p>
            <p class="mt-1 text-3xl font-bold text-amber-600">{{ overdueBooks.filter(r => r.daysOverdue > 7).length }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-red-200 bg-red-50 shadow-sm overflow-hidden">
      <div class="border-b border-red-100 px-5 py-4">
        <h2 class="font-semibold text-slate-900">Overdue Items</h2>
        <p class="mt-1 text-xs text-slate-500">Books past their due date</p>
      </div>
      <div v-if="overdueBooks.length" class="divide-y divide-red-100">
        <div v-for="item in overdueBooks" :key="item.id" class="flex items-center gap-3 px-5 py-4">
          <div class="h-10 w-7 rounded shrink-0" :style="{ background: item.book?.spineColor || '#ccc' }"></div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-800">{{ item.book?.title || 'Unknown' }}</p>
            <p class="text-xs text-slate-500">{{ item.userName }} · {{ item.userEmail }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-slate-700">Due {{ item.dueDate }}</p>
            <p class="text-xs font-medium" :class="item.daysOverdue > 7 ? 'text-red-600' : 'text-amber-600'">
              {{ item.daysOverdue }} days overdue
            </p>
          </div>
        </div>
      </div>
      <p v-else class="p-8 text-center text-sm text-slate-500">No overdue books. All loans are on time.</p>
    </section>
  </div>
</template>
