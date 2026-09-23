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
          class="text-sm font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
        >
          Back to book
        </NuxtLink>

        <h1 class="mt-3 font-display text-4xl leading-tight text-emerald-900">
          {{ book?.title }}
        </h1>

        <p class="mt-1 text-sm text-emerald-700">
          {{ book?.author }}
        </p>
      </div>

      <a
        v-if="pdfUrl"
        :href="pdfUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-card border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50"
      >
        Download PDF
      </a>
    </div>

    <!-- PDF Viewer -->
    <div v-if="pdfUrl" class="reader-shell relative w-full overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,118,110,0.12)]">
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
      class="empty-state-enter rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center text-emerald-700"
    >
      This book does not have a PDF file attached yet.
    </div>

  </div>
</template>