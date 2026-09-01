<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
const { books } = useCatalog()
const { requests } = useRequests()

const categoryStats = computed(() => {
  const stats: Record<string, { count: number; borrowed: number; available: number }> = {}
  books.value.forEach((book) => {
    if (!stats[book.category]) {
      stats[book.category] = { count: 0, borrowed: 0, available: 0 }
    }
    stats[book.category].count++
    stats[book.category].borrowed += book.availability.checkedOut
    stats[book.category].available += Math.max(book.availability.digitalCopies - book.availability.checkedOut, 0)
  })
  return Object.entries(stats).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.count - a.count)
})

const totalBooks = computed(() => books.value.length)
const totalBorrowed = computed(() => books.value.reduce((sum, b) => sum + b.availability.checkedOut, 0))
const totalAvailable = computed(() => books.value.reduce((sum, b) => sum + Math.max(b.availability.digitalCopies - b.availability.checkedOut, 0), 0))
const totalCategories = computed(() => categoryStats.value.length)
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div>
      <p class="text-sm text-slate-500">Book Collection</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Total Categories</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ totalCategories }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Total Books</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ totalBooks }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Total Borrowed</p>
        <p class="mt-2 text-3xl font-bold text-amber-600">{{ totalBorrowed }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Total Available</p>
        <p class="mt-2 text-3xl font-bold text-emerald-600">{{ totalAvailable }}</p>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="border-b border-slate-100 px-5 py-4">
        <h2 class="font-semibold text-slate-900">Category Breakdown</h2>
        <p class="mt-1 text-xs text-slate-500">Books by category</p>
      </div>
      <div class="divide-y divide-slate-100">
        <div v-for="cat in categoryStats" :key="cat.name" class="flex items-center gap-4 px-5 py-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">
            {{ cat.name.charAt(0) }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-slate-800">{{ cat.name }}</p>
            <div class="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${(cat.count / totalBooks) * 100}%` }"></div>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-slate-900">{{ cat.count }}</p>
            <p class="text-xs text-slate-500">books</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-emerald-600">{{ cat.available }}</p>
            <p class="text-xs text-slate-500">available</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-amber-600">{{ cat.borrowed }}</p>
            <p class="text-xs text-slate-500">borrowed</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
