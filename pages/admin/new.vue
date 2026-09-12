<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

import { useCatalog } from '~/composables/useCatalog'
import type { NewBookInput } from '~/composables/useCatalog'

const { addBook } = useCatalog()
const { push: toast } = useToast()
const router = useRouter()

async function onSubmit(input: NewBookInput) {
  const book = await addBook(input)
  toast(`Added "${book.title}" to the catalog.`)
  router.push(`/products/${book.id}`)
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <nav class="flex items-center gap-2 text-xs text-ink-soft dark:text-slate-400">
      <NuxtLink to="/admin" class="hover:text-ink dark:hover:text-white hover:underline font-medium">Admin</NuxtLink>
      <span class="text-slate-300 dark:text-slate-600">/</span>
      <span class="text-ink dark:text-white font-medium">Add new book</span>
    </nav>
    <div>
      <h1 class="font-display text-3xl font-semibold text-ink dark:text-white tracking-tight">Add a new book</h1>
      <p class="text-sm text-ink-soft dark:text-slate-400 mt-2">Fill in the details below to add a new title to the catalog.</p>
    </div>
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
      <AdminBookForm submit-label="Add to catalog" @submit="onSubmit" />
    </div>
  </div>
</template>
