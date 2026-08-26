<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

import { useCatalog } from '~/composables/useCatalog'
import { getCoverUrl, type Book } from '~/data/books'

const { books, deletedBooks, deleteBook, restoreBook } = useCatalog()
const { push: toast } = useToast()

const query = ref('')
const confirmingId = ref<number | null>(null)

const filtered = computed(() => {
  if (!query.value.trim()) return books.value
  const q = query.value.trim().toLowerCase()
  return books.value.filter(
    (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  )
})

function askDelete(id: number) {
  confirmingId.value = id
}

function confirmDelete(id: number, title: string) {
  const deleted = deleteBook(id)
  confirmingId.value = null
  if (deleted) {
    toast(`Deleted "${title}".`, 'info', {
      label: 'Restore',
      run: () => {
        restoreBook(deleted)
        toast(`Restored "${deleted.title}".`)
      }
    })
  }
}

function restoreFromLog(book: Book) {
  restoreBook(book)
  toast(`Restored "${book.title}".`)
}
</script>

<template>
  <div class="page-shell">
    <header class="flex items-start justify-between gap-4 flex-wrap mb-8">
      <div>
        <p class="page-eyebrow">Admin</p>
        <h1 class="page-title">
          Catalog management
        </h1>
        <p class="text-ink-soft text-[15px] mt-2">
          {{ books.length }} books total. Add, edit, or remove titles from the catalog.
        </p>
      </div>
      <NuxtLink
        to="/admin/new"
        class="rounded-card bg-ink text-white font-semibold text-sm px-5 py-2.5 hover:bg-ink-light transition inline-flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Add new book
      </NuxtLink>
    </header>

    <div class="grid sm:grid-cols-3 gap-4 mb-8">
      <div class="surface-card p-5">
        <p class="text-sm text-ink-soft">Catalog titles</p>
        <p class="mt-1 font-display text-3xl font-semibold">{{ books.length }}</p>
      </div>
      <div class="surface-card p-5">
        <p class="text-sm text-ink-soft">Available copies</p>
        <p class="mt-1 font-display text-3xl font-semibold">
          {{
            books.reduce(
              (total, book) =>
                total + book.availability.digitalCopies - book.availability.checkedOut,
              0
            )
          }}
        </p>
      </div>
      <NuxtLink
        to="/admin/inventory"
        class="rounded-2xl bg-ink p-5 text-white transition hover:bg-ink-light"
        ><p class="text-sm text-white/65">Operations</p>
        <p class="mt-1 font-display text-xl font-semibold">Import, export & stock →</p></NuxtLink
      >
    </div>

    <input
      v-model="query"
      type="search"
      placeholder="Search by title or author…"
      class="w-full max-w-sm rounded-full border border-line bg-white px-4 py-2 text-sm mb-6"
    />

    <div class="surface-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr
            class="border-b border-line text-left text-ink-soft font-mono text-[11px] uppercase tracking-wide"
          >
            <th class="px-4 py-3 font-medium">Title</th>
            <th class="px-4 py-3 font-medium hidden sm:table-cell">Subject</th>
            <th class="px-4 py-3 font-medium hidden md:table-cell">Price</th>
            <th class="px-4 py-3 font-medium hidden md:table-cell">Rating</th>
            <th class="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="b in filtered"
            :key="b.id"
            class="border-b border-line last:border-0 hover:bg-parchment-dim"
          >
            <td class="px-4 py-3">
              <NuxtLink :to="`/products/${b.id}`" class="font-semibold hover:underline">{{
                b.title
              }}</NuxtLink>
              <p class="text-xs text-ink-soft">{{ b.author }}</p>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell text-ink-soft">{{ b.category }}</td>
            <td class="px-4 py-3 hidden md:table-cell font-mono">${{ b.price.toFixed(2) }}</td>
            <td class="px-4 py-3 hidden md:table-cell font-mono">{{ b.rating.toFixed(1) }}</td>
            <td class="px-4 py-3">
              <div v-if="confirmingId !== b.id" class="flex items-center justify-end gap-3">
                <NuxtLink
                  :to="`/admin/${b.id}/edit`"
                  class="text-amber-deep font-semibold text-xs hover:underline"
                  >Edit</NuxtLink
                >
                <button
                  type="button"
                  class="text-rose font-semibold text-xs hover:underline"
                  @click="askDelete(b.id)"
                >
                  Delete
                </button>
              </div>
              <div v-else class="flex items-center justify-end gap-2">
                <span class="text-xs text-ink-soft">Confirm?</span>
                <button
                  type="button"
                  class="text-rose font-semibold text-xs hover:underline"
                  @click="confirmDelete(b.id, b.title)"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  class="text-ink-soft text-xs hover:underline"
                  @click="confirmingId = null"
                >
                  Cancel
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtered.length" class="text-center text-ink-soft text-sm py-10">
        No books match your search.
      </p>
    </div>

    <section v-if="deletedBooks.length" class="mt-8 overflow-hidden rounded-2xl border border-line bg-white">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <div>
          <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">Restore log</p>
          <h2 class="mt-1 font-display text-xl font-semibold">Recently deleted books</h2>
        </div>
        <span class="rounded-full bg-rose/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-rose">{{ deletedBooks.length }} deleted</span>
      </div>
      <div class="divide-y divide-line">
        <div v-for="item in deletedBooks" :key="item.book.id" class="flex items-center gap-4 p-4">
          <BookCoverImage :src="item.book.coverUrl" :fallback="getCoverUrl(item.book.category)" :alt="item.book.title" class="h-12 w-10 rounded-lg object-cover" />
          <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">{{ item.book.title }}</p><p class="text-xs text-ink-soft">{{ item.book.author }} · Deleted {{ new Date(item.deletedAt).toLocaleDateString() }}</p></div>
          <button type="button" class="rounded-lg border border-sage px-3 py-2 text-xs font-semibold text-sage hover:bg-sage hover:text-white" @click="restoreFromLog(item.book)">Restore book</button>
        </div>
      </div>
    </section>
  </div>
</template>
