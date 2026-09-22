<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  ChevronDown,
  BookOpen,
  BookMarked,
  BookCheck,
  X
} from '@lucide/vue'

const { push: toast } = useToast()
const { categories, refresh, addCategory, updateCategory, deleteCategory } = useCategoryManagement()

const searchQuery = ref('')
const sortBy = ref<'name' | 'books' | 'borrowed'>('name')
const newCategoryName = ref('')
const editingId = ref<string | null>(null)
const editingName = ref('')
const deleteConfirming = ref<string | null>(null)
const isLoading = ref(false)
const showAddCategory = ref(false)

const filteredCategories = computed(() => {
  let result = categories.value

  // Search filter
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    result = result.filter(cat => cat.name.toLowerCase().includes(q))
  }

  // Sort
  return result.sort((a, b) => {
    switch (sortBy.value) {
      case 'books':
        return (b.booksCount || 0) - (a.booksCount || 0)
      case 'borrowed':
        return (b.borrowedCount || 0) - (a.borrowedCount || 0)
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })
})

const totalCategories = computed(() => categories.value.length)
const totalBooks = computed(() => categories.value.reduce((sum, cat) => sum + (cat.booksCount || 0), 0))
const totalBorrowed = computed(() => categories.value.reduce((sum, cat) => sum + (cat.borrowedCount || 0), 0))
const totalAvailable = computed(() => categories.value.reduce((sum, cat) => sum + (cat.availableCount || 0), 0))

function onSearch() {
  // Search is reactive
}

function clearSearch() {
  searchQuery.value = ''
}

async function onAddCategory() {
  if (!newCategoryName.value.trim()) {
    toast('Please enter a category name.', 'error')
    return
  }

  isLoading.value = true
  try {
    const name = newCategoryName.value.trim()
    await addCategory(name)
    await refresh()
    toast(`Category "${name}" added successfully.`, 'success')
    newCategoryName.value = ''
    showAddCategory.value = false
  } catch (err: any) {
    toast(err?.data?.statusMessage || err?.message || 'Failed to add category.', 'error')
  } finally {
    isLoading.value = false
  }
}

function startEdit(id: string, name: string) {
  editingId.value = id
  editingName.value = name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

async function onSaveEdit() {
  if (!editingName.value.trim()) {
    toast('Please enter a category name.', 'error')
    return
  }

  isLoading.value = true
  try {
    await updateCategory(editingId.value!, editingName.value.trim())
    toast('Category updated successfully.', 'success')
    editingId.value = null
    editingName.value = ''
  } catch (err: any) {
    toast(err?.message || 'Failed to update category.', 'error')
  } finally {
    isLoading.value = false
  }
}

function confirmDelete(id: string) {
  deleteConfirming.value = id
}

function cancelDelete() {
  deleteConfirming.value = null
}

async function onDelete(id: string) {
  isLoading.value = true
  try {
    const category = categories.value.find(c => c.id === id)
    if (category) {
      await deleteCategory(id)
      toast(`"${category.name}" category deleted.`, 'success')
      deleteConfirming.value = null
    }
  } catch (err: any) {
    toast(err?.message || 'Failed to delete category.', 'error')
  } finally {
    isLoading.value = false
  }
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
          <span class="text-slate-900 font-medium">Categories</span>
        </nav>
        <h1 class="font-display text-3xl font-semibold text-slate-900 tracking-tight">Categories</h1>
        <p class="text-sm text-slate-500 mt-2">Manage book categories. Add, edit, or remove categories from your library.</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><FolderOpen class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Total</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ totalCategories }}</p>
        <p class="mt-1 text-xs text-slate-500">Categories</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600"><BookOpen class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Books</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ totalBooks }}</p>
        <p class="mt-1 text-xs text-slate-500">Total books</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><BookMarked class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Borrowed</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ totalBorrowed }}</p>
        <p class="mt-1 text-xs text-slate-500">Copies borrowed</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><BookCheck class="h-5 w-5" /></div>
          <span class="text-xs text-slate-400">Available</span>
        </div>
        <p class="mt-3 text-2xl font-bold text-slate-900">{{ totalAvailable }}</p>
        <p class="mt-1 text-xs text-slate-500">Copies available</p>
      </article>
    </section>

    <!-- Add Category Action -->
    <section class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 class="font-semibold text-slate-900">Categories</h2>
        <p class="mt-1 text-sm text-slate-500">Create a new subject for your library.</p>
      </div>
      <button
        type="button"
        class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        @click="showAddCategory = true"
      >
        <Plus class="h-4 w-4" />
        Add Category
      </button>
    </section>

    <div v-if="showAddCategory" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" @click.self="showAddCategory = false">
      <form class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" @submit.prevent="onAddCategory">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Add New Category</h2>
          <button type="button" class="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close" @click="showAddCategory = false">
            <X class="h-5 w-5" />
          </button>
        </div>
        <input
          v-model="newCategoryName"
          type="text"
          required
          autofocus
          placeholder="Enter category name..."
          class="mt-5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <div class="mt-5 flex justify-end gap-3">
          <button type="button" class="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" @click="showAddCategory = false">Cancel</button>
          <button type="submit" :disabled="isLoading" class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {{ isLoading ? 'Adding...' : 'Save Category' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Search & Filters -->
    <section class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search categories..."
            class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            @keydown.enter="onSearch"
          />
        </div>
        <div class="flex gap-2">
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
        <!-- Sort By -->
        <div class="relative group">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Sort: {{ { name: 'Name', books: 'Books', borrowed: 'Borrowed' }[sortBy] }}
            <ChevronDown class="h-4 w-4" />
          </button>
          <div class="absolute left-0 top-full mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
            <button
              v-for="option in [
                { value: 'name' as const, label: 'Name' },
                { value: 'books' as const, label: 'Books' },
                { value: 'borrowed' as const, label: 'Borrowed' }
              ]"
              :key="option.value"
              type="button"
              @click="sortBy = option.value"
              :class="[
                'w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50',
                sortBy === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700',
                option.value !== 'name' ? 'border-t border-slate-100' : ''
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Results count -->
        <div class="flex items-center px-3 py-2 text-sm text-slate-600">
          {{ filteredCategories.length }} categor{{ filteredCategories.length !== 1 ? 'ies' : 'y' }}
        </div>
      </div>
    </section>

    <!-- Categories Table -->
    <section class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div v-if="!filteredCategories.length" class="p-12 text-center">
        <FolderOpen class="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p class="text-slate-500">No categories found matching your search.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-200 bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Books</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Available</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Borrowed</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="cat in filteredCategories" :key="cat.id" class="hover:bg-slate-50 transition">
              <td class="px-6 py-4">
                <div v-if="editingId === cat.id" class="flex gap-2">
                  <input
                    v-model="editingName"
                    type="text"
                    class="flex-1 rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div v-else class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-sm">
                    {{ cat.name.charAt(0) }}
                  </div>
                  <p class="text-sm font-medium text-slate-900">{{ cat.name }}</p>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                  {{ cat.booksCount || 0 }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {{ cat.availableCount || 0 }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {{ cat.borrowedCount || 0 }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ cat.createdAt }}</td>
              <td class="px-6 py-4 text-right">
                <div v-if="editingId === cat.id" class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    @click="onSaveEdit"
                    :disabled="isLoading"
                    class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    {{ isLoading ? 'Saving...' : 'Save' }}
                  </button>
                  <button
                    type="button"
                    @click="cancelEdit"
                    :disabled="isLoading"
                    class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                </div>
                <div v-else class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    @click="startEdit(cat.id, cat.name)"
                    class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                    title="Edit category"
                  >
                    <Edit2 class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete(cat.id)"
                    class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                    title="Delete category"
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
            <h2 class="text-lg font-semibold text-slate-900">Delete category?</h2>
          </div>
          <p class="text-sm text-slate-600 mb-6">
            Are you sure you want to delete "{{ categories.find(c => c.id === deleteConfirming)?.name }}"? This action cannot be undone.
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
              :disabled="isLoading"
              class="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
            >
              {{ isLoading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
