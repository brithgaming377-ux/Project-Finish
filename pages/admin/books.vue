<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

import {
  Search,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  ChevronDown,
  RotateCcw
} from '@lucide/vue'
import type { Book } from '~/data/books'
import { getCoverUrl } from '~/data/books'

const router = useRouter()
const route = useRoute()
const { books, deletedBooks, deleteBook, restoreBook } = useCatalog()
const { push: toast } = useToast()

const searchQuery = ref((route.query.q as string) || '')
const sortBy = ref<'title' | 'author' | 'category' | 'added'>('title')
const categoryFilter = ref<string | 'all'>('all')
const deleteConfirming = ref<number | null>(null)
const isDeleting = ref(false)

// Get unique categories
const categories = computed(() => {
  const cats = new Set(books.value.map(b => b.category))
  return Array.from(cats).sort()
})

// Filtered and sorted books
const filteredBooks = computed(() => {
  let result = books.value

  // Search filter
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    result = result.filter(book =>
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.isbn?.toLowerCase().includes(q)
    )
  }

  // Category filter
  if (categoryFilter.value !== 'all') {
    result = result.filter(b => b.category === categoryFilter.value)
  }

  // Sort
  return result.sort((a, b) => {
    switch (sortBy.value) {
      case 'author':
        return a.author.localeCompare(b.author)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'added':
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
      case 'title':
      default:
        return a.title.localeCompare(b.title)
    }
  })
})

function onSearch() {
  if (searchQuery.value.trim()) {
    router.push({ query: { q: searchQuery.value.trim() } })
  }
}

function clearSearch() {
  searchQuery.value = ''
  router.push({ query: {} })
}

function confirmDelete(bookId: number) {
  deleteConfirming.value = bookId
}

async function onDelete(bookId: number) {
  isDeleting.value = true
  try {
    const book = books.value.find(b => b.id === bookId)
    if (book) {
      await deleteBook(bookId)
      toast(`"${book.title}" has been deleted.`, 'success')
      deleteConfirming.value = null
    }
  } catch (err: any) {
    toast('Failed to delete book.', 'error')
  } finally {
    isDeleting.value = false
  }
}

function cancelDelete() {
  deleteConfirming.value = null
}

async function onRestore(bookId: number) {
  const deleted = deletedBooks.value.find(item => item.book.id === bookId)
  if (!deleted) return
  await restoreBook(deleted.book)
  toast(`"${deleted.book.title}" has been restored.`, 'success')
}

function goToEdit(bookId: number) {
  router.push(`/admin/${bookId}/edit`)
}

function goToNew() {
  router.push('/admin/new')
}

function getAvailableCopies(book: Book): number {
  return Math.max(0, book.availability.digitalCopies - book.availability.checkedOut)
}

function getStockStatus(book: Book): 'low' | 'healthy' {
  const available = getAvailableCopies(book)
  return available <= 1 ? 'low' : 'healthy'
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
          <span class="text-slate-900 font-medium">All Books</span>
        </nav>
        <h1 class="font-display text-3xl font-semibold text-slate-900 tracking-tight">All Books</h1>
        <p class="text-sm text-slate-500 mt-2">Manage your library catalog. Add, edit, or remove titles.</p>
      </div>
      <button
        type="button"
        @click="goToNew"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
      >
        <Plus class="h-4 w-4" />
        Add Book
      </button>
    </div>

    <!-- Search & Filters -->
    <section class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by title, author, or ISBN..."
            class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            @keydown.enter="onSearch"
          />
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            @click="onSearch"
            class="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Search
          </button>
          <button
            v-if="searchQuery"
            type="button"
            @click="clearSearch"
            class="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <!-- Category Filter -->
        <div class="relative group">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Category
            <ChevronDown class="h-4 w-4" />
          </button>
          <div class="absolute left-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
            <button
              type="button"
              @click="categoryFilter = 'all'"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50',
                categoryFilter === 'all' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
              ]"
            >
              All Categories
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              @click="categoryFilter = cat"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 border-t border-slate-100',
                categoryFilter === cat ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
              ]"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Sort By -->
        <div class="relative group">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Sort: {{ { title: 'Title', author: 'Author', category: 'Category', added: 'Date Added' }[sortBy] }}
            <ChevronDown class="h-4 w-4" />
          </button>
          <div class="absolute left-0 top-full mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
            <button
              v-for="option in [
                { value: 'title' as const, label: 'Title' },
                { value: 'author' as const, label: 'Author' },
                { value: 'category' as const, label: 'Category' },
                { value: 'added' as const, label: 'Date Added' }
              ]"
              :key="option.value"
              type="button"
              @click="sortBy = option.value"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50',
                sortBy === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700',
                option.value !== 'title' ? 'border-t border-slate-100' : ''
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Results count -->
        <div class="flex items-center px-3 py-2 text-sm text-slate-600">
          {{ filteredBooks.length }} book{{ filteredBooks.length !== 1 ? 's' : '' }}
        </div>
      </div>
    </section>

    <!-- Books Table -->
    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div v-if="!filteredBooks.length" class="p-12 text-center">
        <BookOpen class="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p class="text-slate-500">No books found matching your search.</p>
        <button
          type="button"
          @click="goToNew"
          class="mt-4 text-sm font-semibold text-blue-600 hover:underline"
        >
          Add the first book <ArrowRight class="ml-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-200 bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Title</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Author</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Level</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Copies</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Available</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="book in filteredBooks" :key="book.id" class="hover:bg-slate-50 transition">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <BookCoverImage
                    :src="book.coverUrl"
                    :fallback="getCoverUrl(book.category)"
                    :alt="book.title"
                    :label="book.title"
                    class="h-14 w-10 shrink-0 overflow-hidden rounded"
                  />
                  <p class="text-sm font-medium text-slate-900 truncate max-w-xs">{{ book.title }}</p>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ book.author }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">
                <span class="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {{ book.category }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ book.level }}</td>
              <td class="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                {{ book.availability.digitalCopies }}
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  :class="[
                    'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                    getStockStatus(book) === 'low'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                  ]"
                >
                  {{ getAvailableCopies(book) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    @click="goToEdit(book.id)"
                    class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                    title="Edit book"
                  >
                    <Edit2 class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete(book.id)"
                    class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                    title="Delete book"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="deletedBooks.length" class="rounded-xl border border-amber-200 bg-amber-50/60 shadow-sm overflow-hidden">
      <div class="flex flex-col gap-2 border-b border-amber-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="font-semibold text-slate-900">Recently deleted</h2>
          <p class="mt-1 text-sm text-slate-600">Restore books that were removed from the catalog.</p>
        </div>
        <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {{ deletedBooks.length }} deleted
        </span>
      </div>
      <div class="divide-y divide-amber-200">
        <div v-for="item in deletedBooks" :key="item.book.id" class="flex flex-wrap items-center gap-3 px-5 py-4">
          <BookCoverImage
            :src="item.book.coverUrl"
            :fallback="getCoverUrl(item.book.category)"
            :alt="item.book.title"
            :label="item.book.title"
            class="h-12 w-9 shrink-0 overflow-hidden rounded"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-900">{{ item.book.title }}</p>
            <p class="truncate text-xs text-slate-600">{{ item.book.author }} · Deleted {{ new Date(item.deletedAt).toLocaleDateString() }}</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition"
            title="Restore book"
            @click="onRestore(item.book.id)"
          >
            <RotateCcw class="h-4 w-4" />
            Restore
          </button>
        </div>
      </div>
    </section>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="deleteConfirming !== null"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="cancelDelete"
      >
        <div class="rounded-xl border border-slate-200 bg-white shadow-xl p-6 max-w-sm mx-4">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Trash2 class="h-5 w-5" />
            </div>
            <h2 class="text-lg font-semibold text-slate-900">Delete book?</h2>
          </div>
          <p class="text-sm text-slate-600 mb-6">
            Are you sure you want to delete "{{ books.find(b => b.id === deleteConfirming)?.title }}"? You can restore it from the Recently deleted section.
          </p>
          <div class="flex gap-3">
            <button
              type="button"
              @click="cancelDelete"
              class="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="onDelete(deleteConfirming)"
              :disabled="isDeleting"
              class="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
