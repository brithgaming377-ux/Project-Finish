<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
const { books } = useCatalog()

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
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
})

const totalAuthors = computed(() => authorStats.value.length)
const topAuthor = computed(() => authorStats.value[0])
const totalBooks = computed(() => books.value.length)
const avgRating = computed(() => {
  if (!books.value.length) return 0
  return Math.round((books.value.reduce((sum, b) => sum + b.rating, 0) / books.value.length) * 10) / 10
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div>
      <p class="text-sm text-slate-500">Book Collection</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Authors</h1>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Total Authors</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ totalAuthors }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Total Books</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ totalBooks }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Top Author</p>
        <p class="mt-2 text-lg font-bold text-slate-900 truncate">{{ topAuthor?.name || 'N/A' }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">Avg Rating</p>
        <p class="mt-2 text-3xl font-bold text-amber-600">{{ avgRating }} <span class="text-sm font-normal text-slate-500">/5</span></p>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="border-b border-slate-100 px-5 py-4">
        <h2 class="font-semibold text-slate-900">Author List</h2>
        <p class="mt-1 text-xs text-slate-500">All authors in library</p>
      </div>
      <div class="divide-y divide-slate-100">
        <div v-for="(author, i) in authorStats" :key="author.name" class="flex items-center gap-4 px-5 py-3">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{{ i + 1 }}</span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-800">{{ author.name }}</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-slate-700">{{ author.count }}</p>
            <p class="text-xs text-slate-400">books</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-amber-600">{{ author.avgRating }}</p>
            <p class="text-xs text-slate-400">rating</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-emerald-600">{{ author.borrowed }}</p>
            <p class="text-xs text-slate-400">borrowed</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
