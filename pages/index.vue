<script setup lang="ts">
import { books, categories } from '~/data/books'

const router = useRouter()
const searchQuery = ref('')

function onSearch() {
  router.push({ path: '/products', query: searchQuery.value ? { q: searchQuery.value } : {} })
}

const categoryCounts = computed(() =>
  categories.map(cat => ({ name: cat, count: books.filter(b => b.category === cat).length }))
)

const categoryIcons: Record<string, string> = {
  Technology: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5',
  Philosophy: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  Science: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c.251-.023.501-.05.75-.082m0 0a24.301 24.301 0 014.5 0m-4.5 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3',
  Leadership: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  Language: 'M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m6.334-12.138a24.65 24.65 0 015.454 3.66',
  History: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A8.959 8.959 0 013 12c0-1.605.42-3.113 1.157-4.418',
  Other: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25'
}

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
          <span><strong class="text-ink">{{ categories.length }}</strong> subjects</span>
          <span><strong class="text-ink">24/7</strong> access</span>
        </div>
      </div>
    </section>

    <!-- Browse by subject -->
    <section class="max-w-6xl mx-auto px-6 py-14">
      <div class="max-w-md mb-8">
        <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">Browse by subject</p>
        <h2 class="font-display font-semibold text-2xl mt-2">Pick a shelf to start with.</h2>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <NuxtLink
          v-for="c in categoryCounts"
          :key="c.name"
          :to="`/products?category=${c.name}`"
          class="border border-line rounded-card bg-white p-5 hover:-translate-y-0.5 hover:shadow-card transition"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="text-amber-deep mb-3">
            <path :d="categoryIcons[c.name]" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
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
