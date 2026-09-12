<script setup lang="ts">
import { normalizeFileUrl } from '~/data/books'

const route = useRoute()

const { getById } = useCatalog()

const book = computed(() => getById(Number(route.params.id)))

const pdfUrl = computed(() => book.value?.fileUrl ?? '')
const isPdfLoading = ref(true)

if (!book.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Book not found',
    fatal: true
  })
}

watch(pdfUrl, () => {
  isPdfLoading.value = Boolean(pdfUrl.value)
}, { immediate: true })

useHead(() => ({
  title: book.value
    ? `Read ${book.value.title} — E-LIBRARY`
    : 'Read — E-LIBRARY'
}))
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-10">

    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <NuxtLink
          :to="`/products/${book?.id}`"
          class="text-sm font-semibold text-amber-deep hover:underline"
        >
          Back to book
        </NuxtLink>

        <h1 class="mt-3 font-display text-4xl leading-tight">
          {{ book?.title }}
        </h1>

        <p class="mt-1 text-sm text-ink-soft">
          {{ book?.author }}
        </p>
      </div>

      <a
        v-if="pdfUrl"
        :href="pdfUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-card border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-ink hover:text-ink"
      >
        Open PDF separately
      </a>
    </div>

    <!-- PDF -->
    <div v-if="pdfUrl" class="reader-shell relative w-full overflow-hidden rounded-2xl border border-line bg-white">
      <div v-if="isPdfLoading" class="absolute inset-0 z-10 flex min-h-[40vh] items-center justify-center bg-white/90 backdrop-blur-sm" aria-live="polite">
        <div class="flex items-center gap-3 text-sm text-ink-soft">
          <span class="reader-spinner" aria-hidden="true" />
          Loading reader...
        </div>
      </div>
      <iframe
        :src="pdfUrl"
        title="Book PDF"
        class="block w-full"
        style="height: 80vh; border: 0;"
        @load="isPdfLoading = false"
      ></iframe>
    </div>

    <!-- No PDF -->
    <div
      v-else
      class="empty-state-enter rounded-2xl border border-line bg-white p-8 text-center text-ink-soft"
    >
      This book does not have a PDF file attached yet.
    </div>

  </div>
</template>