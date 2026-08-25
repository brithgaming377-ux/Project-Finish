<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

import { useCatalog } from '~/composables/useCatalog'
import type { NewBookInput } from '~/composables/useCatalog'

const { addBook } = useCatalog()
const { push: toast } = useToast()
const router = useRouter()

function onSubmit(input: NewBookInput) {
  const book = addBook(input)
  toast(`Added "${book.title}" to the catalog.`)
  router.push(`/products/${book.id}`)
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-12 pb-20">
    <nav class="flex items-center gap-2 text-xs text-ink-soft mb-6">
      <NuxtLink to="/admin" class="hover:text-ink hover:underline">Admin</NuxtLink>
      <span>/</span>
      <span class="text-ink font-semibold">Add new book</span>
    </nav>

    <h1 class="font-display font-semibold text-[clamp(24px,3.4vw,32px)] mb-8">Add a new book</h1>

    <div class="bg-white border border-line rounded-card p-6 sm:p-7">
      <AdminBookForm submit-label="Add to catalog" @submit="onSubmit" />
    </div>
  </div>
</template>
