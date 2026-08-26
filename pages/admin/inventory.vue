<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
import { useCatalog } from '~/composables/useCatalog'
import type { Book } from '~/data/books'

const { books, importBooks } = useCatalog()
const { push: toast } = useToast()
const fileInput = ref<HTMLInputElement | null>(null)
const totalCopies = computed(() => books.value.reduce((sum, book) => sum + book.availability.digitalCopies, 0))
const borrowed = computed(() => books.value.reduce((sum, book) => sum + book.availability.checkedOut, 0))
const available = computed(() => totalCopies.value - borrowed.value)
const people = [{ name: 'Sokha Kim', role: 'Student', loans: 3, status: 'Active' }, { name: 'Dara Phan', role: 'Student', loans: 2, status: 'Active' }, { name: 'Sreyneang Lim', role: 'Teacher', loans: 1, status: 'Active' }, { name: 'Vuthy Chan', role: 'Student', loans: 0, status: 'New' }]

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
  } catch { toast('Import failed. Please choose a valid catalog JSON file.') }
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-12 pb-20">
    <header class="flex flex-wrap items-start justify-between gap-5"><div><p class="font-mono text-xs uppercase tracking-[0.16em] text-amber-deep">ETEC-LIBRARY / Management</p><h1 class="mt-2 font-display text-4xl font-semibold">Library operations</h1><p class="mt-2 text-ink-soft">Keep an eye on your collection, circulation, and community.</p></div><div class="flex flex-wrap gap-3"><input ref="fileInput" type="file" accept="application/json" class="hidden" @change="onImport" /><button class="rounded-xl border border-ink px-4 py-2.5 text-sm font-semibold hover:bg-ink hover:text-white" @click="fileInput?.click()">Import catalog</button><button class="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-light" @click="exportCatalog">Export catalog</button></div></header>
    <div class="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div v-for="item in [{ label: 'Book titles', value: books.length, note: 'in collection' }, { label: 'Digital copies', value: totalCopies, note: 'licensed copies' }, { label: 'Currently borrowed', value: borrowed, note: 'active loans' }, { label: 'Available now', value: available, note: 'ready to read' }]" :key="item.label" class="rounded-2xl border border-line bg-white p-5"><p class="text-sm text-ink-soft">{{ item.label }}</p><p class="mt-2 font-display text-4xl font-semibold">{{ item.value }}</p><p class="mt-2 font-mono text-[10px] uppercase tracking-wide text-sage">{{ item.note }}</p></div></div>
    <div class="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><section class="overflow-hidden rounded-2xl border border-line bg-white"><div class="flex items-center justify-between border-b border-line p-5"><div><h2 class="font-display text-xl font-semibold">Stock overview</h2><p class="mt-1 text-sm text-ink-soft">Books that need attention.</p></div><NuxtLink to="/admin" class="text-sm font-semibold text-amber-deep hover:underline">Manage books →</NuxtLink></div><div class="divide-y divide-line"><div v-for="book in books.slice(0, 6)" :key="book.id" class="flex items-center gap-3 p-4"><img :src="book.coverUrl" :alt="book.title" class="h-12 w-10 rounded-lg object-cover" /><div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">{{ book.title }}</p><p class="text-xs text-ink-soft">{{ book.availability.digitalCopies - book.availability.checkedOut }} of {{ book.availability.digitalCopies }} copies available</p></div><span class="rounded-full px-2 py-1 font-mono text-[10px]" :class="book.availability.digitalCopies - book.availability.checkedOut < 2 ? 'bg-rose/10 text-rose' : 'bg-sage/10 text-sage'">{{ book.availability.digitalCopies - book.availability.checkedOut < 2 ? 'Low stock' : 'Healthy' }}</span></div></div></section><section class="overflow-hidden rounded-2xl border border-line bg-white"><div class="border-b border-line p-5"><h2 class="font-display text-xl font-semibold">People & loans</h2><p class="mt-1 text-sm text-ink-soft">Recent library activity.</p></div><div class="divide-y divide-line"><div v-for="person in people" :key="person.name" class="flex items-center gap-3 p-4"><span class="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-sm font-semibold text-white">{{ person.name.charAt(0) }}</span><div class="flex-1"><p class="text-sm font-semibold">{{ person.name }}</p><p class="text-xs text-ink-soft">{{ person.role }} · {{ person.loans }} active loans</p></div><span class="font-mono text-[10px] text-sage">{{ person.status }}</span></div></div></section></div>
  </div>
</template>
