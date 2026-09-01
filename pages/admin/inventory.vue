<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import {
  Search,
  Upload,
  Download,
  BookOpen,
  BookCheck,
  AlertTriangle,
  Package
} from '@lucide/vue'

const { books, importBooks } = useCatalog()
const { push: toast } = useToast()
const fileInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const stockFilter = ref<'all' | 'low' | 'healthy'>('all')
const stockFilters = computed(() => [
  { value: 'all' as const, label: 'All titles' },
  { value: 'low' as const, label: `Low stock (${lowStockBooks.value.length})` },
  { value: 'healthy' as const, label: 'Healthy' }
])
const totalCopies = computed(() =>
  books.value.reduce((sum, book) => sum + book.availability.digitalCopies, 0)
)
const borrowed = computed(() =>
  books.value.reduce((sum, book) => sum + book.availability.checkedOut, 0)
)
const available = computed(() => totalCopies.value - borrowed.value)
const lowStockBooks = computed(() =>
  books.value
    .filter((book) => book.availability.digitalCopies - book.availability.checkedOut <= 1)
    .sort(
      (a, b) =>
        a.availability.digitalCopies -
        a.availability.checkedOut -
        (b.availability.digitalCopies - b.availability.checkedOut)
    )
)
const filteredBooks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return books.value
    .filter((book) => {
      const copies = book.availability.digitalCopies - book.availability.checkedOut
      const matchesStatus =
        stockFilter.value === 'all' || (stockFilter.value === 'low' ? copies <= 1 : copies > 1)
      return (
        matchesStatus && (!query || `${book.title} ${book.author}`.toLowerCase().includes(query))
      )
    })
    .sort(
      (a, b) =>
        a.availability.digitalCopies -
        a.availability.checkedOut -
        (b.availability.digitalCopies - b.availability.checkedOut)
    )
})

function exportCatalog() {
  const blob = new Blob([JSON.stringify(books.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'etec-library-catalog.json'
  link.click()
  URL.revokeObjectURL(url)
  toast('Catalog export downloaded.')
}
async function onImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const data = JSON.parse(await file.text()) as Book[]
    const count = importBooks(Array.isArray(data) ? data : [])
    toast(`${count} book records imported.`)
  } catch {
    toast('Import failed. Please choose a valid catalog JSON file.')
  }
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
      <div>
        <nav class="flex items-center gap-2 text-xs text-ink-soft dark:text-slate-400 mb-2">
          <span class="font-mono">Admin</span>
          <span class="text-slate-300 dark:text-slate-600">/</span>
          <span class="text-ink dark:text-white font-medium">Inventory</span>
        </nav>
        <h1 class="font-display text-3xl font-semibold text-ink dark:text-white tracking-tight">
          Library operations
        </h1>
        <p class="text-sm text-ink-soft dark:text-slate-400 mt-2">
          Keep an eye on your collection, circulation, and community.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <input
          ref="fileInput"
          type="file"
          accept="application/json"
          class="hidden"
          @change="onImport"
        />
        <button
          class="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-ink dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-all active:scale-[0.98]"
          @click="fileInput?.click()"
        >
          Import catalog
        </button>
        <button
          class="rounded-lg bg-ink dark:bg-amber dark:text-ink text-white px-4 py-2.5 text-sm font-semibold hover:bg-ink-light dark:hover:bg-amber-deep transition-all shadow-sm active:scale-[0.98]"
          @click="exportCatalog"
        >
          Export catalog
        </button>
      </div>
    </header>
    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Operations overview">
      <article
        v-for="item in [
          { label: 'Book titles', value: books.length, note: 'in collection' },
          { label: 'Digital copies', value: totalCopies, note: 'licensed copies' },
          { label: 'Currently borrowed', value: borrowed, note: 'active loans' },
          { label: 'Available now', value: available, note: 'ready to read' }
        ]"
        :key="item.label"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
      >
        <p class="text-xs font-semibold text-ink-soft dark:text-slate-400 uppercase tracking-wider">
          {{ item.label }}
        </p>
        <p class="mt-3 font-display text-3xl font-semibold text-ink dark:text-white tracking-tight">
          {{ item.value }}
        </p>
        <p class="mt-1.5 text-[11px] text-sage font-medium">{{ item.note }}</p>
      </article>
    </section>
    <div class="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <section
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        <div
          class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-5"
        >
          <div>
            <h2 class="font-display text-lg font-semibold text-ink dark:text-white">
              Stock overview
            </h2>
            <p class="text-xs text-ink-soft dark:text-slate-400 mt-0.5">
              Books that need attention.
            </p>
          </div>
          <NuxtLink
            to="/admin"
            class="text-xs font-semibold text-amber-deep dark:text-amber hover:underline underline-offset-2"
            >Manage books →</NuxtLink
          >
        </div>
        <div class="border-b border-slate-200 dark:border-slate-700 px-6 py-3 space-y-3">
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft dark:text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" />
              <path d="m16 16 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search stock by title or author"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-ink placeholder:text-ink-soft/70 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400"
            />
          </div>
          <div class="flex gap-2 overflow-x-auto pb-0.5">
            <button
              v-for="filter in stockFilters"
              :key="filter.value"
              type="button"
              class="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors"
              :class="
                stockFilter === filter.value
                  ? 'bg-ink text-white dark:bg-amber dark:text-ink'
                  : 'bg-slate-100 text-ink-soft hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              "
              @click="stockFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
        <div class="divide-y divide-slate-200 dark:divide-slate-700">
          <div
            v-for="book in filteredBooks.slice(0, 8)"
            :key="book.id"
            class="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <BookCoverImage
              :src="book.coverUrl"
              :fallback="getCoverUrl(book.category)"
              :alt="book.title"
              class="h-11 w-9 rounded-lg object-cover"
            />
            <div class="min-w-0 flex-1">
              <NuxtLink
                :to="`/admin/${book.id}/edit`"
                class="block truncate text-sm font-medium text-ink hover:text-amber-deep dark:text-white dark:hover:text-amber"
                >{{ book.title }}</NuxtLink
              >
              <p class="text-[11px] text-ink-soft dark:text-slate-400">
                {{ book.availability.digitalCopies - book.availability.checkedOut }} of
                {{ book.availability.digitalCopies }} copies available
              </p>
            </div>
            <span
              class="rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold shrink-0"
              :class="
                book.availability.digitalCopies - book.availability.checkedOut < 2
                  ? 'bg-rose/10 text-rose'
                  : 'bg-sage/10 text-sage'
              "
            >
              {{
                book.availability.digitalCopies - book.availability.checkedOut < 2
                  ? 'Low stock'
                  : 'Healthy'
              }}
            </span>
          </div>
          <p
            v-if="!filteredBooks.length"
            class="px-6 py-10 text-center text-sm text-ink-soft dark:text-slate-400"
          >
            No titles match this stock view.
          </p>
        </div>
      </section>
      <section
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        <div class="border-b border-slate-200 dark:border-slate-700 px-6 py-5">
          <h2 class="font-display text-lg font-semibold text-ink dark:text-white">
            People & loans
          </h2>
          <p class="text-xs text-ink-soft dark:text-slate-400 mt-0.5">Recent library activity.</p>
        </div>
        <div class="divide-y divide-slate-200 dark:divide-slate-700">
          <div
            class="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-ink font-display text-xs font-semibold text-white"
              >S</span
            >
            <div class="flex-1">
              <p class="text-sm font-medium text-ink dark:text-white">Sokha Kim</p>
              <p class="text-[11px] text-ink-soft dark:text-slate-400">Student · 3 active loans</p>
            </div>
            <span class="font-mono text-[10px] text-sage font-semibold">Active</span>
          </div>
          <div
            class="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-ink font-display text-xs font-semibold text-white"
              >D</span
            >
            <div class="flex-1">
              <p class="text-sm font-medium text-ink dark:text-white">Dara Phan</p>
              <p class="text-[11px] text-ink-soft dark:text-slate-400">Student · 2 active loans</p>
            </div>
            <span class="font-mono text-[10px] text-sage font-semibold">Active</span>
          </div>
          <div
            class="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber font-display text-xs font-semibold text-white"
              >S</span
            >
            <div class="flex-1">
              <p class="text-sm font-medium text-ink dark:text-white">Sreyneang Lim</p>
              <p class="text-[11px] text-ink-soft dark:text-slate-400">Teacher · 1 active loan</p>
            </div>
            <span class="font-mono text-[10px] text-sage font-semibold">Active</span>
          </div>
          <div
            class="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-sage font-display text-xs font-semibold text-white"
              >V</span
            >
            <div class="flex-1">
              <p class="text-sm font-medium text-ink dark:text-white">Vuthy Chan</p>
              <p class="text-[11px] text-ink-soft dark:text-slate-400">Student · 0 active loans</p>
            </div>
            <span class="font-mono text-[10px] text-ink-soft dark:text-slate-400 font-semibold"
              >New</span
            >
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
