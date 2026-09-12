<script setup lang="ts">
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

const props = defineProps<{
  url: string
}>()

const { pdf, pages } = usePDF(props.url)
</script>

<template>
  <div class="overflow-auto rounded-2xl border border-line bg-ink/5 p-3 sm:p-6">
    <div v-if="!pdf" class="flex min-h-[60vh] items-center justify-center text-sm text-ink-soft">
      Loading PDF...
    </div>
    <div v-else class="space-y-6">
      <VuePDF
        v-for="page in pages"
        :key="page"
        :pdf="pdf"
        :page="page"
        fit-parent
        text-layer
        annotation-layer
      />
    </div>
  </div>
</template>
