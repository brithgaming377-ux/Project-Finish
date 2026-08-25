<script setup lang="ts">
import { categories } from '~/data/books'
import { subjects } from '~/data/subjects'
import { useCatalog } from '~/composables/useCatalog'

const { books } = useCatalog()
const router = useRouter()
const searchQuery = ref('')

function onSearch() {
  router.push({ path: '/products', query: searchQuery.value ? { q: searchQuery.value } : {} })
}

const subjectCounts = computed(() =>
  subjects.map(s => ({ ...s, count: books.value.filter(b => b.category === s.name).length }))
)

const features = [
  { title: 'Read anywhere', desc: 'Every title opens straight in your browser — no app, no account wall.' },
  { title: 'Built for study', desc: 'Catalog records include subjects, call numbers and formats like a real library OPAC.' },
  { title: 'Always free', desc: 'Marginalia stays free for students, teachers and independent learners.' }
]

const testimonials = [
  { name: 'Sokha K.', role: 'Computer Science student', quote: 'Found half the readings for my networks course here — saved me from buying three textbooks.' },
  { name: 'Anna B.', role: 'High school teacher', quote: 'I point my students to Marginalia instead of a paywalled database. It just works.' },
  { name: 'Vuthy S.', role: 'Self-taught developer', quote: 'The catalog filtering makes it easy to find something relevant instead of scrolling forever.' }
]

const email = ref('')
const subscribed = ref(false)
</script>

<template>
  <div>
    <!-- Hero: search-first -->
    <section class="pt-14 pb-16 bg-gradient-to-b from-parchment-dim to-parchment">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">Free digital library catalog</p>
        <h1 class="font-display font-semibold text-[clamp(28px,5vw,46px)] leading-tight mt-3">
          Search the catalog. Find your next book.
        </h1>
        <p class="text-ink-soft text-base mt-4 max-w-xl mx-auto">
          Marginalia indexes every title by subject, author and call number — built like a
          university library catalog, free for anyone to use.
        </p>

        <form class="mt-8 flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto" @submit.prevent="onSearch">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by title, author, or subject…"
            class="flex-1 rounded-card border border-line bg-white px-4 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          />
          <button type="submit" class="rounded-card bg-ink text-parchment font-semibold text-sm px-6 py-3 hover:bg-ink-light transition">
            Search catalog
          </button>
        </form>

        <div class="flex items-center justify-center gap-6 mt-6 font-mono text-xs text-ink-soft">
          <span><strong class="text-ink">{{ books.length }}</strong> titles</span>
          <span><strong class="text-ink">{{ subjects.length }}</strong> subjects</span>
          <span><strong class="text-ink">24/7</strong> access</span>
        </div>
      </div>
    </section>

    <!-- Browse by subject -->
    <section class="max-w-6xl mx-auto px-6 py-14">
      <div class="max-w-md mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">Browse by subject</p>
          <h2 class="font-display font-semibold text-2xl mt-2">Pick a shelf to start with.</h2>
        </div>
        <NuxtLink to="/subjects" class="text-sm font-semibold text-amber-deep hover:underline">View all subjects &rarr;</NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <NuxtLink
          v-for="c in subjectCounts"
          :key="c.slug"
          :to="`/subjects/${c.slug}`"
          class="border border-line rounded-card bg-white p-5 hover:-translate-y-0.5 hover:shadow-card transition"
        >
          <div class="w-9 h-9 rounded-card flex items-center justify-center mb-3" :style="{ background: c.color + '1a' }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :style="{ color: c.color }">
              <path :d="c.icon" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <p class="font-semibold text-sm">{{ c.name }}</p>
          <p class="text-xs text-ink-soft mt-0.5 font-mono">{{ c.count }} titles</p>
        </NuxtLink>
      </div>
    </section>

    <!-- Features -->
    <section class="bg-ink text-parchment py-14">
      <div class="max-w-6xl mx-auto px-6">
        <div class="max-w-md mb-8">
          <p class="font-mono text-xs uppercase tracking-wide text-amber">Why Marginalia</p>
          <h2 class="font-display font-semibold text-2xl mt-2">Built to get out of your way.</h2>
        </div>
        <div class="grid sm:grid-cols-3 gap-5">
          <div v-for="f in features" :key="f.title" class="border border-parchment/15 rounded-card p-5">
            <h3 class="font-semibold text-base">{{ f.title }}</h3>
            <p class="text-sm text-parchment/65 mt-2">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="max-w-6xl mx-auto px-6 py-14">
      <div class="max-w-md mb-8">
        <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">From readers</p>
        <h2 class="font-display font-semibold text-2xl mt-2">What people are saying.</h2>
      </div>
      <div class="grid sm:grid-cols-3 gap-5">
        <blockquote v-for="t in testimonials" :key="t.name" class="border border-line rounded-card bg-white p-5 flex flex-col gap-3.5">
          <StarRating :rating="5" :size="12" />
          <p class="font-display text-[15.5px] leading-snug">&ldquo;{{ t.quote }}&rdquo;</p>
          <footer class="flex items-center gap-2.5 mt-auto">
            <span class="w-8 h-8 rounded-full bg-ink text-parchment flex items-center justify-center font-display font-semibold text-[13px] shrink-0">{{ t.name.charAt(0) }}</span>
            <div>
              <p class="text-[13px] font-semibold">{{ t.name }}</p>
              <p class="text-xs text-ink-soft">{{ t.role }}</p>
            </div>
          </footer>
        </blockquote>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="max-w-6xl mx-auto px-6 pb-20">
      <div class="bg-parchment-dim border border-line rounded-2xl p-8 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-7">
        <div>
          <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">Stay in the loop</p>
          <h2 class="font-display font-semibold text-2xl mt-2">New titles, straight to your inbox.</h2>
          <p class="text-ink-soft text-sm mt-2 max-w-sm">One short email a month — new additions to the catalog, nothing else.</p>
        </div>
        <form class="flex gap-2.5 flex-wrap" @submit.prevent="subscribed = true">
          <template v-if="!subscribed">
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              required
              aria-label="Email address"
              class="min-w-[220px] rounded-card border border-line bg-white px-3.5 py-2.5 text-sm"
            />
            <button type="submit" class="rounded-card bg-ink text-parchment font-semibold text-sm px-5 py-2.5 hover:bg-ink-light transition">Subscribe</button>
          </template>
          <p v-else class="font-semibold text-sm text-sage">You're on the list — thanks for subscribing.</p>
        </form>
      </div>
    </section>
  </div>
</template>
