<script setup lang="ts">
const route = useRoute()

const { getById } = useCatalog()

const book = computed(() => getById(Number(route.params.id)))

const pdfUrl = computed(() => book.value?.fileUrl ?? '')

if (!book.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Book not found',
    fatal: true
  })
}

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
        Download PDF
      </a>
    </div>

    <!-- PDF Viewer -->
    <div v-if="pdfUrl" class="reader-shell relative w-full overflow-hidden rounded-2xl border border-line bg-white">
      <object
        :data="pdfUrl"
        type="application/pdf"
        class="block w-full"
        style="height: 80vh;"
      >
        <p>
          Your browser does not support PDFs.
          <a :href="pdfUrl" target="_blank" class="text-amber-deep underline">Download the PDF instead</a>
        </p>
      </object>
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