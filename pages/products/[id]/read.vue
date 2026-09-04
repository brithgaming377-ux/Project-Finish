<script setup lang="ts">
import { ArrowLeft, Minus, Plus, Type, AlignLeft } from '@lucide/vue'
import { useCatalog } from '~/composables/useCatalog'
import { useLibrary } from '~/composables/useLibrary'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))

const { getById } = useCatalog()
const book = computed(() => getById(id.value))

if (!book.value) {
  throw createError({ statusCode: 404, statusMessage: 'Book not found', fatal: true })
}

const { isLoggedIn, user } = useAuth()
const { isBorrowed } = useLibrary()
if (import.meta.client && !isLoggedIn.value) {
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

// Redirect to book detail if book requires borrowing and user hasn't borrowed it
if (import.meta.client && book.value?.requiresBorrow && !isBorrowed(id.value)) {
  router.replace(`/products/${id.value}`)
}

useHead(() => ({ title: book.value ? `Reading — ${book.value.title}` : 'Reading' }))

// Build a set of "pages" out of the chapter list + description, so there's
// real, book-specific content to page through rather than a lorem-ipsum filler.
const pages = computed(() => {
  if (!book.value) return []
  const b = book.value
  const list: { heading: string; body: string }[] = [
    {
      heading: 'Title Page',
      body: `${b.title}\nby ${b.author}\n\n${b.publisher} — ${b.edition === 1 ? '1st' : b.edition + 'th'} edition`
    }
  ]
  b.tableOfContents.forEach((chapter, i) => {
    const paragraph = b.longDescription[i % b.longDescription.length]
    list.push({ heading: `Chapter ${i + 1}: ${chapter}`, body: paragraph })
  })
  return list
})

const pageIndex = ref(0)
const zoom = ref(100)
const fontFamily = ref<'serif' | 'sans'>('serif')

const totalPages = computed(() => pages.value.length)
const currentPage = computed(() => pages.value[pageIndex.value])

function next() {
  if (pageIndex.value < totalPages.value - 1) pageIndex.value++
}
function prev() {
  if (pageIndex.value > 0) pageIndex.value--
}
function goTo(n: number) {
  pageIndex.value = Math.min(Math.max(n, 0), totalPages.value - 1)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="book" class="min-h-screen bg-ink flex flex-col">
    <!-- Toolbar -->
    <div class="bg-ink text-white border-b border-white/10">
      <div class="max-w-6xl mx-auto px-5 py-3 flex items-center gap-4 flex-wrap">
        <NuxtLink
          :to="`/products/${book.id}`"
          class="flex items-center gap-1.5 text-sm text-white/70 hover:text-white shrink-0 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Exit reader
        </NuxtLink>

        <div class="h-4 w-px bg-white/15 hidden sm:block" />

        <p class="font-display font-semibold text-sm truncate max-w-[240px]">{{ book.title }}</p>

        <div class="flex items-center gap-2 ml-auto">
          <div class="flex items-center rounded-lg bg-white/5 p-0.5">
            <button
              class="p-1.5 rounded hover:bg-white/10 transition-colors"
              type="button"
              aria-label="Zoom out"
              @click="zoom = Math.max(70, zoom - 10)"
            >
              <Minus class="h-4 w-4" />
            </button>
            <span class="font-mono text-xs w-12 text-center select-none">{{ zoom }}%</span>
            <button
              class="p-1.5 rounded hover:bg-white/10 transition-colors"
              type="button"
              aria-label="Zoom in"
              @click="zoom = Math.min(150, zoom + 10)"
            >
              <Plus class="h-4 w-4" />
            </button>
          </div>

          <div class="w-px h-5 bg-white/15 mx-1" />

          <div class="flex items-center rounded-lg bg-white/5 p-0.5">
            <button
              class="font-mono text-xs px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-colors"
              :class="fontFamily === 'serif' ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'"
              type="button"
              @click="fontFamily = 'serif'"
            >
              <Type class="h-3.5 w-3.5" /> Serif
            </button>
            <button
              class="font-mono text-xs px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-colors"
              :class="fontFamily === 'sans' ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'"
              type="button"
              @click="fontFamily = 'sans'"
            >
              <AlignLeft class="h-3.5 w-3.5" /> Sans
            </button>
          </div>

          <div class="w-px h-5 bg-white/15 mx-1" />

          <span class="font-mono text-xs text-white/60 tabular-nums"
            >{{ pageIndex + 1 }} / {{ totalPages }}</span
          >
        </div>
      </div>
    </div>

    <!-- Page -->
    <div class="flex-1 flex items-center justify-center px-6 py-10 overflow-auto bg-ink/95">
      <div
        class="bg-white rounded-lg shadow-cover w-full max-w-2xl px-10 py-14 sm:px-14 border border-white/10"
        :style="{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }"
      >
        <p class="font-mono text-[11px] text-ink-soft uppercase tracking-wide mb-6">
          {{ book.title }}
        </p>
        <h2
          class="font-semibold text-2xl mb-6"
          :class="fontFamily === 'serif' ? 'font-display' : 'font-body'"
        >
          {{ currentPage?.heading }}
        </h2>
        <p
          class="text-[15px] leading-relaxed text-ink whitespace-pre-line"
          :class="fontFamily === 'serif' ? 'font-display' : 'font-body'"
        >
          {{ currentPage?.body }}
        </p>
        <p class="font-mono text-xs text-ink-soft text-center mt-14">{{ pageIndex + 1 }}</p>
      </div>
    </div>

    <!-- Bottom nav -->
    <div class="bg-ink border-t border-white/10 px-5 py-3 flex items-center justify-between">
      <button
        class="flex items-center gap-1.5 text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:text-amber transition-colors"
        type="button"
        :disabled="pageIndex === 0"
        @click="prev"
      >
        <ArrowLeft class="h-4 w-4" />
        Previous
      </button>

      <input
        type="range"
        min="0"
        :max="totalPages - 1"
        :value="pageIndex"
        class="mx-4 flex-1 max-w-md accent-amber h-1.5 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber [&::-webkit-slider-thumb]:cursor-pointer"
        @input="goTo(Number(($event.target as HTMLInputElement).value))"
      />

      <button
        class="flex items-center gap-1.5 text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:text-amber transition-colors"
        type="button"
        :disabled="pageIndex === totalPages - 1"
        @click="next"
      >
        Next
        <ArrowLeft class="h-4 w-4 rotate-180" />
      </button>
    </div>
  </div>
</template>
