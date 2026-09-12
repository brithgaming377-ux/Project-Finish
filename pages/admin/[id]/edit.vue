<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

import { useCatalog } from '~/composables/useCatalog'
import type { NewBookInput } from '~/composables/useCatalog'

const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))

const { getById, updateBook, deleteBook, restoreBook } = useCatalog()
const book = computed(() => getById(id.value))

if (!book.value) {
  throw createError({ statusCode: 404, statusMessage: 'Book not found', fatal: true })
}

const { push: toast } = useToast()
const confirmingDelete = ref(false)

async function onSubmit(input: NewBookInput) {
  await updateBook(id.value, input)
  toast(`Saved changes to "${input.title}".`)
  router.push(`/products/${id.value}`)
}

async function onDelete() {
  if (!book.value) return
  const deleted = await deleteBook(id.value)
  if (deleted) {
    toast(`Deleted "${deleted.title}".`, 'info', {
      label: 'Restore',
      run: () => {
        restoreBook(deleted)
        toast(`Restored "${deleted.title}".`)
      }
    })
  }
  router.push('/admin')
}
</script>

<template>
  <div v-if="book" class="max-w-4xl mx-auto space-y-6">
    <nav class="flex items-center gap-2 text-xs text-ink-soft dark:text-slate-400">
      <NuxtLink to="/admin" class="hover:text-ink dark:hover:text-white hover:underline font-medium">Admin</NuxtLink>
      <span class="text-slate-300 dark:text-slate-600">/</span>
      <span class="text-ink dark:text-white font-medium">Edit &ldquo;{{ book.title }}&rdquo;</span>
    </nav>
    <div>
      <h1 class="font-display text-3xl font-semibold text-ink dark:text-white tracking-tight">Edit book</h1>
      <p class="text-sm text-ink-soft dark:text-slate-400 mt-2">Update the details for this title in the catalog.</p>
    </div>
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
      <AdminBookForm :initial="book" submit-label="Save changes" @submit="onSubmit">
        <template #extra-actions>
          <button v-if="!confirmingDelete" type="button" class="text-rose font-semibold text-sm ml-auto hover:underline underline-offset-2" @click="confirmingDelete = true">Delete this book</button>
          <div v-else class="flex items-center gap-3 ml-auto">
            <span class="text-xs text-ink-soft dark:text-slate-400">Are you sure?</span>
            <button type="button" class="text-rose font-semibold text-sm hover:underline underline-offset-2" @click="onDelete">Yes, delete</button>
            <button type="button" class="text-xs text-ink-soft dark:text-slate-400 hover:text-ink dark:hover:text-white" @click="confirmingDelete = false">Cancel</button>
          </div>
        </template>
      </AdminBookForm>
    </div>
  </div>
</template>
