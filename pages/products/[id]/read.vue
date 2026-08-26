<script setup lang="ts">
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
if (import.meta.client && !isLoggedIn.value) {
  router.push({ path: '/login', query: { redirect: route.fullPath } })
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
          class="flex items-center gap-1.5 text-sm text-white/70 hover:text-white shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Exit reader
        </NuxtLink>

        <p class="font-display font-semibold text-sm truncate max-w-[240px]">{{ book.title }}</p>

        <div class="flex items-center gap-2 ml-auto">
          <button
            class="p-1.5 rounded hover:bg-white/10"
            type="button"
            aria-label="Zoom out"
            @click="zoom = Math.max(70, zoom - 10)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
          <span class="font-mono text-xs w-10 text-center">{{ zoom }}%</span>
          <button
            class="p-1.5 rounded hover:bg-white/10"
            type="button"
            aria-label="Zoom in"
            @click="zoom = Math.min(150, zoom + 10)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <div class="w-px h-5 bg-white/15 mx-1" />

          <button
            class="font-mono text-xs px-2.5 py-1 rounded"
            :class="fontFamily === 'serif' ? 'bg-white/15' : 'hover:bg-white/10'"
            type="button"
            @click="fontFamily = 'serif'"
          >
            Serif
          </button>
          <button
            class="font-mono text-xs px-2.5 py-1 rounded"
            :class="fontFamily === 'sans' ? 'bg-white/15' : 'hover:bg-white/10'"
            type="button"
            @click="fontFamily = 'sans'"
          >
            Sans
          </button>

          <div class="w-px h-5 bg-white/15 mx-1" />

          <span class="font-mono text-xs text-white/60"
            >{{ pageIndex + 1 }} / {{ totalPages }}</span
          >
        </div>
      </div>
    </div>

    <!-- Page -->
    <div class="flex-1 flex items-center justify-center px-6 py-10 overflow-auto">
      <div
        class="bg-white rounded shadow-2xl w-full max-w-2xl px-10 py-14 sm:px-14"
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
        class="flex items-center gap-1.5 text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
        type="button"
        :disabled="pageIndex === 0"
        @click="prev"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 19l-7-7 7-7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Previous
      </button>

      <input
        type="range"
        min="0"
        :max="totalPages - 1"
        :value="pageIndex"
        class="mx-4 flex-1 max-w-md accent-amber"
        @input="goTo(Number(($event.target as HTMLInputElement).value))"
      />

      <button
        class="flex items-center gap-1.5 text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
        type="button"
        :disabled="pageIndex === totalPages - 1"
        @click="next"
      >
        Next
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 5l7 7-7 7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
