<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

import { useCatalog } from '~/composables/useCatalog'
import type { NewBookInput } from '~/composables/useCatalog'

const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))

const { getById, updateBook, deleteBook } = useCatalog()
const book = computed(() => getById(id.value))

if (!book.value) {
  throw createError({ statusCode: 404, statusMessage: 'Book not found', fatal: true })
}

const { push: toast } = useToast()
const confirmingDelete = ref(false)

function onSubmit(input: NewBookInput) {
  updateBook(id.value, input)
  toast(`Saved changes to "${input.title}".`)
  router.push(`/products/${id.value}`)
}

function onDelete() {
  if (!book.value) return
  deleteBook(id.value)
  toast(`Deleted "${book.value.title}".`)
  router.push('/admin')
}
</script>

<template>
  <div v-if="book" class="max-w-2xl mx-auto px-6 py-12 pb-20">
    <nav class="flex items-center gap-2 text-xs text-ink-soft mb-6">
      <NuxtLink to="/admin" class="hover:text-ink hover:underline">Admin</NuxtLink>
      <span>/</span>
      <span class="text-ink font-semibold">Edit &ldquo;{{ book.title }}&rdquo;</span>
    </nav>

    <h1 class="font-display font-semibold text-[clamp(24px,3.4vw,32px)] mb-8">Edit book</h1>

    <div class="bg-white border border-line rounded-card p-6 sm:p-7">
      <AdminBookForm :initial="book" submit-label="Save changes" @submit="onSubmit">
        <template #extra-actions>
          <button
            v-if="!confirmingDelete"
            type="button"
            class="text-rose font-semibold text-sm ml-auto hover:underline"
            @click="confirmingDelete = true"
          >
            Delete this book
          </button>
          <div v-else class="flex items-center gap-3 ml-auto">
            <span class="text-xs text-ink-soft">Are you sure?</span>
            <button type="button" class="text-rose font-semibold text-sm hover:underline" @click="onDelete">Yes, delete</button>
            <button type="button" class="text-ink-soft text-sm hover:underline" @click="confirmingDelete = false">Cancel</button>
          </div>
        </template>
      </AdminBookForm>
    </div>
  </div>
</template>
