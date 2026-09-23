<script setup lang="ts">
import { BookOpen, LockKeyhole, Pencil } from '@lucide/vue'
import { formatYear, getCoverUrl } from '~/data/books'
import { useCatalog } from '~/composables/useCatalog'
import { useLibrary } from '~/composables/useLibrary'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))

const { getById, books } = useCatalog()
const book = computed(() => getById(id.value))

if (!book.value) {
  throw createError({ statusCode: 404, statusMessage: 'Book not found', fatal: true })
}

const related = computed(() => {
  if (!book.value) return []
  return books.value
    .filter((b) => b.category === book.value!.category && b.id !== book.value!.id)
    .slice(0, 4)
})

useHead(() => ({
  title: book.value ? `${book.value.title} — Marginalia` : 'Marginalia'
}))

const { isAdmin, isLoggedIn, user } = useAuth()
const { data: adminData } = useAdminLibrary()
const { submit, forUser } = useRequests()
const {
  isSaved,
  isBorrowed,
  toggleSave,
  borrow,
  returnBook,
  exchange,
  state
} = useLibrary()
const { push: toast } = useToast()
const myRequests = computed(() => (user.value ? forUser(user.value.email).value : []))
const borrowRequest = computed(() => myRequests.value.find((request) => request.bookId === id.value && request.kind === 'borrow' && ['pending', 'approved'].includes(request.status)))
const approvedBorrow = computed(() => myRequests.value.some((request) => request.bookId === id.value && request.kind === 'borrow' && request.status === 'approved'))
const activeBorrowCount = computed(() => myRequests.value.filter((request) => request.kind === 'borrow' && ['pending', 'approved'].includes(request.status)).length)

const activeTab = ref<'description' | 'contents' | 'reviews' | 'citation'>('description')
const showExchangePanel = ref(false)

const copiesLeft = computed(() => {
  if (!book.value) return 0
  return Math.max(book.value.availability.digitalCopies - book.value.availability.checkedOut, 0)
})

const ratingBreakdown = computed(() => {
  if (!book.value) return []
  const total = book.value.reviews.length || 1
  return [5, 4, 3, 2, 1].map((star) => {
    const count = book.value!.reviews.filter((r) => Math.round(r.rating) === star).length
    return { star, count, pct: Math.round((count / total) * 100) }
  })
})

const apaCitation = computed(() => {
  if (!book.value) return ''
  const b = book.value
  return `${b.author} (${formatYear(b.year)}). ${b.title} (${b.edition === 1 ? '1st' : b.edition + 'th'} ed.). ${b.publisher}.`
})

const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'contents', label: 'Table of Contents' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'citation', label: 'Cite this' }
] as const

function requireLogin(action: () => void) {
  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  action()
}

function onSave() {
  requireLogin(() => {
    toggleSave(id.value)
    toast(isSaved(id.value) ? 'Saved to your account.' : 'Removed from saved.')
  })
}

async function onBorrow() {
  requireLogin(async () => {
    if (!adminData.value.settings.borrowingEnabled) {
      toast('Borrowing is currently disabled by the library.', 'error')
      return
    }
    if (activeBorrowCount.value >= adminData.value.settings.maxBooks) {
      toast(`You can borrow up to ${adminData.value.settings.maxBooks} books.`, 'error')
      return
    }
    if (copiesLeft.value === 0) {
      toast('No copies available right now.', 'error')
      return
    }
    if (!await submit('borrow', id.value, user.value!.name, user.value!.email)) return toast('You already have a request for this book.', 'error')
    toast('Borrow request sent to the admin for approval.')
  })
}

function onReturn() {
  returnBook(id.value)
  toast('Returned. Thanks!')
}

// Other borrowed books eligible to trade for this one
const swappableBooks = computed(() =>
  books.value.filter(
    (b) => state.value.borrowed.some((r) => r.bookId === b.id) && b.id !== id.value
  )
)

const canRead = computed(() => {
  if (!book.value) return false
  if (!book.value.requiresBorrow) return true
  return isBorrowed(book.value.id) || approvedBorrow.value
})

function onExchange(otherId: number) {
  exchange(otherId, id.value)
  toast('Exchanged successfully.')
  showExchangePanel.value = false
}
</script>

<template>
  <div v-if="book" class="max-w-6xl mx-auto px-6 py-9 pb-20">
    <!-- Breadcrumb -->
    <nav
      class="flex items-center gap-2 flex-wrap text-xs text-ink-soft mb-7"
      aria-label="Breadcrumb"
    >
      <NuxtLink to="/" class="text-emerald-700 hover:text-emerald-900 hover:underline">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/products" class="text-emerald-700 hover:text-emerald-900 hover:underline">Products</NuxtLink>
      <span>/</span>
      <NuxtLink
        :to="`/products?category=${book.category}`"
        class="text-emerald-700 hover:text-emerald-900 hover:underline"
        >{{ book.category }}</NuxtLink
      >
      <span>/</span>
      <span class="font-semibold text-emerald-900">{{ book.title }}</span>
      <NuxtLink
        v-if="isAdmin"
        :to="`/admin/${book.id}/edit`"
        class="ml-auto inline-flex items-center gap-1.5 text-amber-deep font-semibold hover:underline"
      >
        <Pencil class="h-3.5 w-3.5" aria-hidden="true" />
        Edit in admin
      </NuxtLink>
    </nav>

    <div class="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
      <!-- Sidebar -->
      <RevealOnScroll as="aside" class="self-start rounded-2xl border border-emerald-200 bg-gradient-to-br from-white via-emerald-50/60 to-white p-4 shadow-[0_18px_40px_-32px_rgba(15,118,110,0.35)] lg:sticky lg:top-24">
        <div class="flex flex-col gap-4">
        <div class="relative aspect-[2/3] max-h-[360px] overflow-hidden rounded-card bg-emerald-50 shadow-cover">
          <BookCoverImage
            :src="book.coverUrl"
            :fallback="getCoverUrl(book.category)"
            :alt="`Cover for ${book.title}`"
            class="h-full w-full object-cover"
          />
        </div>
        <div class="flex items-start justify-between gap-3 px-1 pt-1">
          <div>
            <p class="font-display text-lg font-semibold leading-snug text-emerald-900">{{ book.title }}</p>
            <p class="mt-1 font-mono text-[11px] uppercase tracking-wide text-emerald-700">{{ book.pages }}p &middot; {{ book.format }}</p>
          </div>
          <span class="shrink-0 rounded-full bg-emerald-100 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-emerald-800">{{ book.level }}</span>
        </div>

        <div class="flex items-center gap-2 text-[13px] text-emerald-700">
          <span
            class="w-2 h-2 rounded-full shrink-0"
            :class="copiesLeft > 0 ? 'bg-sage' : 'bg-rose'"
          />
          <span v-if="copiesLeft > 0"
            >{{ copiesLeft }} of {{ book.availability.digitalCopies }} copies available</span
          >
          <span v-else>All copies currently checked out</span>
        </div>

        <div class="flex flex-col gap-2 border-t border-line pt-4">
          <button
            v-if="!isBorrowed(book.id)"
            class="premium-interaction rounded-card bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            :disabled="copiesLeft === 0 || !!borrowRequest || !adminData.settings.borrowingEnabled"
            @click="onBorrow"
          >
            {{ !adminData.settings.borrowingEnabled ? 'Borrowing disabled' : borrowRequest?.status === 'approved' ? 'Borrow approved ✓' : borrowRequest ? 'Borrow requested' : copiesLeft > 0 ? 'Borrow this book' : 'Join waitlist' }}
          </button>
          <button
            v-else
            class="premium-interaction rounded-card border border-emerald-200 text-emerald-900 font-semibold text-sm px-5 py-2.5 hover:border-emerald-400"
            type="button"
            @click="onReturn"
          >
            Return borrowed copy
          </button>

          <div class="flex gap-2">
            <button
              class="premium-interaction flex-1 rounded-card font-semibold text-sm px-4 py-2.5 text-center border"
              :class="
                isSaved(book.id)
                  ? 'border-ink text-ink'
                  : 'border-line text-ink-soft hover:border-ink hover:text-ink'
              "
              type="button"
              @click="onSave"
            >
              {{ isSaved(book.id) ? 'Favorited ♡' : 'Favorites' }}
            </button>
            <button
              v-if="book.exchangeable"
              class="premium-interaction flex-1 rounded-card border border-line text-ink-soft text-sm font-semibold px-4 py-2.5 hover:border-ink hover:text-ink"
              type="button"
              @click="showExchangePanel = !showExchangePanel"
            >
              Exchange
            </button>
          </div>

          <NuxtLink
            v-if="canRead && book.fileUrl"
            :to="`/products/${book.id}/read`"
            class="premium-interaction rounded-card border border-emerald-500 bg-emerald-600 text-white font-semibold text-sm px-5 py-2.5 text-center hover:bg-emerald-500 flex items-center justify-center gap-2"
          >
            <BookOpen class="h-4 w-4" aria-hidden="true" />
            Read now
          </NuxtLink>
          <NuxtLink
            v-else-if="canRead"
            :to="`/products/${book.id}/read`"
            class="premium-interaction rounded-card border border-emerald-500 bg-emerald-600 text-white font-semibold text-sm px-5 py-2.5 text-center hover:bg-emerald-500 flex items-center justify-center gap-2"
          >
            <BookOpen class="h-4 w-4" aria-hidden="true" />
            Read now
          </NuxtLink>
          <p
            v-else
            class="rounded-card border border-line text-ink-soft text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2"
          >
            <LockKeyhole class="h-4 w-4" aria-hidden="true" />
            Borrow to read
          </p>
        </div>

        <!-- Exchange panel -->
        <div
          v-if="showExchangePanel"
          class="border border-line rounded-card p-3.5 bg-parchment-dim"
        >
          <p class="text-xs font-semibold mb-2">Trade a borrowed book for this one:</p>
          <div v-if="swappableBooks.length" class="flex flex-col gap-1.5">
            <button
              v-for="b in swappableBooks"
              :key="b.id"
              class="text-left text-xs bg-white border border-line rounded-card px-2.5 py-2 hover:border-ink transition"
              type="button"
              @click="onExchange(b.id)"
            >
              {{ b.title }}
            </button>
          </div>
          <p v-else class="text-xs text-ink-soft">
            You don't have any borrowed books to trade yet.
          </p>
        </div>

        <dl class="flex flex-col gap-2.5 border-t border-line pt-4 text-[12.5px]">
          <div class="flex justify-between gap-3">
            <dt class="text-ink-soft">Call number</dt>
            <dd class="font-mono font-semibold">{{ book.callNumber }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-soft">ISBN</dt>
            <dd class="font-semibold">{{ book.isbn }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-soft">Publisher</dt>
            <dd class="font-semibold text-right">{{ book.publisher }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-soft">Edition</dt>
            <dd class="font-semibold">{{ book.edition === 1 ? '1st' : `${book.edition}th` }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-soft">Language</dt>
            <dd class="font-semibold text-right">{{ book.language }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-soft">Format</dt>
            <dd class="font-semibold">{{ book.format }} &middot; {{ book.fileSizeMb }} MB</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-soft">Reading time</dt>
            <dd class="font-semibold">~{{ book.readingTimeHours }} hrs</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-soft">Added to catalog</dt>
            <dd class="font-semibold">{{ book.addedDate }}</dd>
          </div>
        </dl>
        </div>
      </RevealOnScroll>

      <!-- Main -->
      <RevealOnScroll :delay="100">
        <span class="font-mono text-[11.5px] uppercase tracking-wide text-amber-deep">{{
          book.category
        }}</span>
        <h1 class="font-display font-semibold text-[clamp(26px,3.6vw,38px)] mt-2">
          {{ book.title }}
        </h1>
        <p class="text-ink-soft text-[15px] mt-1.5">
          by {{ book.author }} &middot; {{ formatYear(book.year) }}
        </p>

        <div class="mt-5 flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white/70 px-4 py-3">
          <StarRating :rating="book.rating" :size="16" />
          <span class="font-bold text-[15px]">{{ book.rating.toFixed(1) }}</span>
          <span class="text-[13px] text-ink-soft"
            >{{ book.ratingsCount }} ratings &middot; {{ book.reviews.length }} reviews</span
          >
        </div>

        <!-- Subject headings -->
        <div class="flex flex-wrap gap-2 mt-4">
          <NuxtLink
            v-for="subject in book.subjects"
            :key="subject"
            :to="`/products?q=${subject}`"
            class="font-mono text-[11px] px-3 py-1.5 rounded-full bg-parchment-dim text-ink-soft border border-line hover:border-ink hover:text-ink transition"
          >
            {{ subject }}
          </NuxtLink>
        </div>

        <!-- Tabs -->
        <div class="mt-8 flex gap-6 overflow-x-auto border-b border-line">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="text-[13.5px] font-semibold pb-2.5 border-b-2 whitespace-nowrap"
            :class="
              activeTab === tab.id
                ? 'text-ink border-amber'
                : 'text-ink-soft border-transparent hover:text-ink'
            "
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Description -->
        <div v-if="activeTab === 'description'" class="pt-6">
          <p
            v-for="(para, i) in book.longDescription"
            :key="i"
            class="text-ink-soft text-[14.5px] max-w-[66ch] mb-4 leading-relaxed"
          >
            {{ para }}
          </p>
        </div>

        <!-- Table of contents -->
        <div v-else-if="activeTab === 'contents'" class="pt-6">
          <ol class="max-w-[52ch]">
            <li
              v-for="(chapter, i) in book.tableOfContents"
              :key="chapter"
              class="flex gap-3.5 py-2.5 border-b border-line text-sm"
            >
              <span class="font-mono text-amber-deep text-xs shrink-0">{{
                String(i + 1).padStart(2, '0')
              }}</span>
              <span>{{ chapter }}</span>
            </li>
          </ol>
        </div>

        <!-- Reviews -->
        <div v-else-if="activeTab === 'reviews'" class="pt-6">
          <div class="flex gap-10 flex-wrap pb-6 mb-6 border-b border-line">
            <div class="flex flex-col gap-1.5 items-start">
              <span class="font-display font-semibold text-4xl">{{ book.rating.toFixed(1) }}</span>
              <StarRating :rating="book.rating" :size="14" />
              <span class="text-xs text-ink-soft">{{ book.ratingsCount }} ratings</span>
            </div>
            <div class="flex-1 min-w-[200px] flex flex-col gap-1.5 justify-center">
              <div
                v-for="row in ratingBreakdown"
                :key="row.star"
                class="flex items-center gap-2.5 text-xs"
              >
                <span class="w-6 font-mono text-ink-soft">{{ row.star }}★</span>
                <div class="flex-1 h-1.5 bg-parchment-dim rounded-full overflow-hidden">
                  <div class="h-full bg-amber" :style="{ width: row.pct + '%' }" />
                </div>
                <span class="w-5 text-right font-mono text-ink-soft">{{ row.count }}</span>
              </div>
            </div>
          </div>

          <ul class="flex flex-col gap-5">
            <li v-for="(rev, i) in book.reviews" :key="i">
              <div class="flex items-center gap-3">
                <span
                  class="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center font-display font-semibold text-[13px] shrink-0"
                  >{{ rev.name.charAt(0) }}</span
                >
                <div>
                  <p class="text-[13.5px] font-semibold">{{ rev.name }}</p>
                  <StarRating :rating="rev.rating" :size="11" />
                </div>
                <span class="ml-auto font-mono text-[11.5px] text-ink-soft">{{ rev.date }}</span>
              </div>
              <p class="text-sm text-ink-soft mt-2.5 ml-12 max-w-[60ch]">{{ rev.comment }}</p>
            </li>
          </ul>
        </div>

        <!-- Citation -->
        <div v-else class="pt-6">
          <p class="text-[13px] text-ink-soft mb-3">APA-style citation for this edition:</p>
          <div
            class="bg-parchment-dim border border-line rounded-card p-4 font-mono text-[13px] leading-relaxed max-w-[62ch]"
          >
            {{ apaCitation }}
          </div>
        </div>
      </RevealOnScroll>
    </div>

    <!-- Related -->
    <RevealOnScroll v-if="related.length" as="section" :delay="80" class="mt-16 border-t border-line pt-8">
      <h2 class="text-xl font-display font-semibold mb-5">More in {{ book.category }}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <BookCard v-for="b in related" :key="b.id" :book="b" />
      </div>
    </RevealOnScroll>
  </div>
</template>
