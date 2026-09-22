<script setup lang="ts">
import { ArrowRight, Bell, BookOpen, Brain, FlaskConical, Globe2, Languages, Search, Users } from '@lucide/vue'
import { subjects } from '~/data/subjects'
import { getCoverUrl } from '~/data/books'
import { useCatalog } from '~/composables/useCatalog'
const { books } = useCatalog()
const router = useRouter()
const searchQuery = ref('')
const subjectCounts = computed(() =>
  subjects.map((subject) => ({
    ...subject,
    count: books.value.filter((book) => book.category === subject.name).length
  }))
)
const featured = computed(() => books.value.slice(0, 3))
const subjectIcons = { technology: Brain, philosophy: BookOpen, science: FlaskConical, leadership: Users, language: Languages, history: Globe2, other: BookOpen }
const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=2200&q=85',
    eyebrow: 'ETEC Center Digital Library',
    title: 'A home for curious minds.',
    description: 'Explore a growing collection of books, subjects, and study-ready resources for the ETEC learning community.'
  },
  {
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2200&q=85',
    eyebrow: 'Knowledge without limits',
    title: 'Find the next idea worth keeping.',
    description: 'Move from a question to a clearer point of view with resources selected for curious, independent learners.'
  },
  {
    image: 'https://stanforddaily.com/wp-content/uploads/2018/05/building-aisle-library-public-library-inventory-bookselling-24143-pxhere.com_.jpg',
    eyebrow: 'Your learning shelf',
    title: 'Read deeply. Go further.',
    description: 'Build your own path through technology, science, languages, humanities, and more.'
  }
]
const activeHeroSlide = ref(0)
let heroSlideTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  heroSlideTimer = setInterval(() => {
    activeHeroSlide.value = (activeHeroSlide.value + 1) % heroSlides.length
  }, 6500)
})

onBeforeUnmount(() => {
  if (heroSlideTimer) clearInterval(heroSlideTimer)
})

function onSearch() {
  router.push({ path: '/products', query: searchQuery.value ? { q: searchQuery.value } : {} })
}
</script>

<template>
  <div>
    <section class="relative isolate overflow-hidden bg-campus py-16 sm:py-24">
      <div class="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
        <div
          v-for="(slide, index) in heroSlides"
          :key="slide.image"
          class="hero-slide hero-drift absolute inset-0 bg-cover bg-center"
          :class="{ 'hero-slide-active': activeHeroSlide === index }"
          :style="{ backgroundImage: `url('${slide.image}')` }"
        />
      </div>
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-campus via-campus/90 to-campus/35" />
      <div class="absolute inset-y-0 right-0 -z-10 w-1/3 border-l border-white/15 bg-white/[0.04]" />
      <div class="hero-light-sweep absolute inset-0 -z-10" aria-hidden="true" />
      <div class="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
        <div :key="activeHeroSlide" class="hero-sequence max-w-2xl text-white">
          <div
            class="hero-sequence-item hero-badge mb-6 inline-flex items-center gap-2 border-l-2 border-amber pl-3 font-mono text-[11px] uppercase tracking-[0.16em] text-amber"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-amber" /> {{ heroSlides[activeHeroSlide].eyebrow }}
          </div>
          <h1 class="hero-sequence-item hero-heading max-w-2xl font-display text-5xl leading-[1.02] tracking-[-0.03em] sm:text-7xl">
            {{ heroSlides[activeHeroSlide].title }}
          </h1>
          <p class="hero-sequence-item hero-description mt-6 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
            {{ heroSlides[activeHeroSlide].description }}
          </p>
          <form
            class="hero-sequence-item hero-search mt-9 flex max-w-xl flex-col gap-2 rounded-2xl border border-white/20 bg-white p-2 shadow-2xl sm:flex-row"
            @submit.prevent="onSearch"
          >
            <div class="flex flex-1 items-center gap-3 px-3">
              <Search class="h-5 w-5 shrink-0 text-ink-soft" aria-hidden="true" /><input
                v-model="searchQuery"
                type="search"
                placeholder="Search books, authors, subjects…"
                class="w-full bg-transparent py-2 text-sm text-ink outline-none"
              />
            </div>
            <button
              type="submit"
              class="premium-interaction rounded-xl bg-amber px-6 py-3 text-sm font-extrabold text-ink hover:bg-amber-deep hover:text-white"
            >
              Explore books
            </button>
          </form>
          <div class="hero-sequence-item hero-stats mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/70">
            <span
              ><strong class="block text-2xl font-semibold text-white">{{ books.length }}+</strong>
              digital books</span
            ><span
              ><strong class="block text-2xl font-semibold text-white">{{
                subjects.length
              }}</strong>
              learning shelves</span
            ><span
              ><strong class="block text-2xl font-semibold text-white">24/7</strong> open
              access</span
            >
          </div>
        </div>
        <div :key="`feature-${activeHeroSlide}`" class="hero-feature-enter hidden border border-white/20 bg-white/10 p-6 backdrop-blur md:block">
          <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-amber">
            Featured this week
          </p>
          <NuxtLink
            v-if="featured[0]"
            :to="`/products/${featured[0].id}`"
            class="premium-interaction mt-5 block overflow-hidden rounded-xl border border-white/20 bg-white text-ink hover:-translate-y-1 hover:shadow-2xl"
            ><BookCoverImage
              :src="featured[0].coverUrl"
              :fallback="getCoverUrl(featured[0].category)"
              :alt="featured[0].title"
              class="h-40 w-full object-cover"
            />
            <div class="p-4">
              <p class="font-display text-xl font-semibold">{{ featured[0].title }}</p>
              <p class="mt-1 text-sm text-ink-soft">{{ featured[0].author }}</p>
            </div></NuxtLink
          >
        </div>
      </div>
      <div class="hero-controls absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-ink/25 px-3 py-2 backdrop-blur-md" aria-label="Hero slideshow controls">
        <button
          v-for="(slide, index) in heroSlides"
          :key="`control-${slide.image}`"
          type="button"
          class="hero-dot"
          :class="{ 'hero-dot-active': activeHeroSlide === index }"
          :aria-label="`Show library story ${index + 1}`"
          :aria-current="activeHeroSlide === index ? 'true' : undefined"
          @click="activeHeroSlide = index"
        >
          <span v-if="activeHeroSlide === index" :key="activeHeroSlide" class="hero-dot-progress" />
        </button>
      </div>
    </section>
    <section class="border-b border-line bg-white">
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3 text-sm">
        <span class="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-crimson">
          <Bell class="h-4 w-4" aria-hidden="true" /> Library notice
        </span>
        <span class="h-4 w-px bg-line" aria-hidden="true" />
        <p class="truncate text-ink-soft">New titles are added regularly across technology, science, languages, and the humanities.</p>
        <NuxtLink to="/products" class="ml-auto hidden shrink-0 font-semibold text-campus hover:text-crimson sm:inline-flex sm:items-center sm:gap-1">View collection <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink>
      </div>
    </section>
    <RevealOnScroll as="section" class="border-b border-line bg-white" :delay="80">
      <div class="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-[1.2fr_.8fr] md:items-end">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-deep">Welcome to E-LIBRARY</p>
          <h2 class="mt-3 max-w-2xl font-display text-3xl leading-tight text-campus sm:text-4xl">A digital academic home for the ETEC community.</h2>
          <p class="mt-4 max-w-2xl leading-7 text-ink-soft">Discover course-ready books, build a personal shelf, and move confidently from your next question to a deeper understanding.</p>
        </div>
        <div class="grid grid-cols-3 gap-3 border-l border-line pl-6">
          <div><strong class="block font-display text-2xl text-campus">{{ books.length }}+</strong><span class="mt-1 block text-[10px] uppercase tracking-wider text-ink-soft">Titles</span></div>
          <div><strong class="block font-display text-2xl text-campus">{{ subjects.length }}</strong><span class="mt-1 block text-[10px] uppercase tracking-wider text-ink-soft">Shelves</span></div>
          <div><strong class="block font-display text-2xl text-campus">24/7</strong><span class="mt-1 block text-[10px] uppercase tracking-wider text-ink-soft">Access</span></div>
        </div>
      </div>
    </RevealOnScroll>
    <RevealOnScroll as="section" class="mx-auto max-w-7xl px-6 py-20">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.16em] text-amber-deep">
            Academic shelves
          </p>
          <h2 class="mt-2 font-display text-4xl leading-none tracking-[-0.02em]">
            Find your next subject.
          </h2>
        </div>
        <NuxtLink to="/subjects" class="text-sm font-semibold text-amber-deep hover:underline"
          >View every subject <ArrowRight class="ml-1 inline h-4 w-4 align-[-3px]" aria-hidden="true" /></NuxtLink
        >
      </div>
      <div class="motion-stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          v-for="subject in subjectCounts"
          :key="subject.slug"
          :to="`/subjects/${subject.slug}`"
          class="premium-interaction group rounded-xl border border-line bg-white p-5 hover:-translate-y-1 hover:shadow-card"
          ><div class="flex items-center justify-between">
            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl"
              :style="{ background: subject.color + '18', color: subject.color }"
              ><component :is="subjectIcons[subject.slug as keyof typeof subjectIcons]" class="h-5 w-5" aria-hidden="true" /></span
            ><ArrowRight class="h-5 w-5 text-ink-soft transition group-hover:translate-x-1" aria-hidden="true" />
          </div>
          <p class="mt-7 font-display text-xl font-semibold">{{ subject.name }}</p>
          <p class="mt-1 text-sm text-ink-soft">{{ subject.count }} titles to explore</p></NuxtLink
        >
      </div>
    </RevealOnScroll>
    <RevealOnScroll as="section" class="bg-parchment-dim py-16" :delay="100">
      <div class="mx-auto max-w-7xl px-6">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="font-mono text-xs uppercase tracking-[0.16em] text-amber-deep">
              Reader favorites
            </p>
            <h2 class="mt-2 font-display text-4xl leading-none tracking-[-0.02em]">
              Make space for a new perspective.
            </h2>
          </div>
          <NuxtLink
            to="/products"
            class="premium-interaction rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink-light"
            >Browse all books</NuxtLink
          >
        </div>
        <div class="motion-stagger mt-8 grid gap-5 md:grid-cols-3">
          <BookCard v-for="book in featured" :key="book.id" :book="book" />
        </div>
      </div>
    </RevealOnScroll>
    <RevealOnScroll as="section" class="mx-auto max-w-7xl px-6 py-16" :delay="140">
      <div class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.16em] text-amber-deep">Learning in motion</p>
          <h2 class="mt-2 font-display text-4xl leading-none tracking-[-0.02em]">Explore the library pillars.</h2>
        </div>
        <NuxtLink to="/about" class="text-sm font-semibold text-campus hover:text-crimson">About E-LIBRARY <ArrowRight class="ml-1 inline h-4 w-4 align-[-3px]" /></NuxtLink>
      </div>
      <div class="motion-stagger mt-8 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
        <article class="library-pillar bg-white p-6 transition hover:bg-campus hover:text-white">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-deep">01 / Discover</p>
          <h3 class="mt-12 font-display text-2xl">A clearer path to the right book.</h3>
          <p class="mt-3 text-sm leading-6 text-ink-soft">Search by subject, author, level, or idea across a growing digital collection.</p>
        </article>
        <article class="library-pillar bg-white p-6 transition hover:bg-campus hover:text-white">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-deep">02 / Read</p>
          <h3 class="mt-12 font-display text-2xl">Study deeply, wherever you are.</h3>
          <p class="mt-3 text-sm leading-6 text-ink-soft">Keep your reading focused with browser-based access and personal shelves.</p>
        </article>
        <article class="library-pillar bg-white p-6 transition hover:bg-campus hover:text-white">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-deep">03 / Share</p>
          <h3 class="mt-12 font-display text-2xl">Build a stronger learning community.</h3>
          <p class="mt-3 text-sm leading-6 text-ink-soft">Borrow, exchange, and return resources as your academic journey evolves.</p>
        </article>
      </div>
    </RevealOnScroll>
    <RevealOnScroll as="section" class="mx-auto max-w-7xl px-6 py-16" :delay="120">
      <div class="grid overflow-hidden rounded-3xl bg-[#DDE9E2]">
        <div class="p-8 sm:p-12">
          <p class="font-mono text-xs uppercase tracking-[0.16em] text-sage">
            Made for the ETEC community
          </p>
          <h2 class="mt-3 font-display text-3xl font-semibold">
            Study smarter. Share what you discover.
          </h2>
          <p class="mt-4 max-w-md leading-relaxed text-ink-soft">
            Build your reading list, discover course-ready titles, and exchange ideas with the ETEC
            learning community.
          </p>
          <NuxtLink
            to="/about"
            class="premium-interaction mt-7 inline-flex rounded-xl border border-ink px-5 py-3 text-sm font-semibold text-ink hover:bg-ink hover:text-white"
            >Discover E-LIBRARY</NuxtLink
          >
        </div>
      </div>
    </RevealOnScroll>
  </div>
</template>
