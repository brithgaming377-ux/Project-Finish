<script setup lang="ts">
import { BookOpen, Check, CreditCard, Library, MapPin, Phone, RefreshCw } from '@lucide/vue'
import { subjects } from '~/data/subjects'
import { useCatalog } from '~/composables/useCatalog'

const { books } = useCatalog()

const services = [
  {
    title: 'Read online',
    desc: 'Every title opens in the built-in reader — no app or download required.',
    icon: BookOpen
  },
  {
    title: 'Borrow freely',
    desc: 'Borrow a digital copy for two weeks and return it when you are done.',
    icon: CreditCard
  },
  {
    title: 'Exchange copies',
    desc: 'Trade a book you\u2019ve already borrowed for a different one, instantly.',
    icon: RefreshCw
  },
  {
    title: 'Catalog records',
    desc: 'Every title has subjects, a call number, ISBN and a ready-made citation.',
    icon: Library
  }
]

const mission = [
  'Provide quality digital learning resources, free of charge',
  'Support students with textbooks and reference material for coursework',
  'Give every title a proper catalog record — subject, call number, citation',
  'Keep the catalog open to add, edit, or retire titles as the collection grows'
]

const faqs = [
  {
    q: 'Is Marginalia really free?',
    a: 'Reading and borrowing are always free for every library member.'
  },
  {
    q: 'How does borrowing work?',
    a: 'Borrowed books are due back in 14 days. You can return early, or exchange a borrowed book for another eligible title.'
  },
  {
    q: 'Can I read without an account?',
    a: 'Browsing the catalog is open to everyone. Saving, borrowing, and reading require a free account.'
  },
  {
    q: 'Who can add books to the catalog?',
    a: 'Catalog management is restricted to Admin accounts, who can add, edit, and remove titles.'
  }
]

const stats = computed(() => [
  { label: 'Titles catalogued', value: String(books.value.length) },
  { label: 'Subjects', value: String(subjects.length) },
  { label: 'Access', value: '24/7' },
  { label: 'Cost to read', value: 'Free' }
])
</script>

<template>
  <div class="page-shell max-w-6xl">
    <header class="mb-12 max-w-[62ch]">
      <p class="page-eyebrow">About E-LIBRARY</p>
      <h1 class="page-title">
        A library that fits in your pocket.
      </h1>
      <p class="page-description max-w-[62ch] text-base">
        Marginalia is a digital library platform that gives students, teachers and researchers
        access to books and educational materials, catalogued and searchable like a university
        library — anytime, anywhere.
      </p>
    </header>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
      <div
        v-for="s in stats"
        :key="s.label"
        class="surface-card p-5 text-center"
      >
        <p class="font-display font-semibold text-2xl">{{ s.value }}</p>
        <p class="font-mono text-[11px] uppercase tracking-wide text-ink-soft mt-1">
          {{ s.label }}
        </p>
      </div>
    </div>

    <section class="grid sm:grid-cols-2 gap-8 py-8 border-t border-b border-line">
      <div>
        <h3 class="text-lg font-semibold mb-2.5">Our vision</h3>
        <p class="text-ink-soft text-sm">
          To become a trusted, free digital library that lowers the barrier to educational resources
          for anyone with an internet connection.
        </p>
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-2.5">Our mission</h3>
        <ul class="space-y-1.5">
          <li v-for="item in mission" :key="item" class="text-ink-soft text-sm flex gap-2">
            <Check class="mt-0.5 h-4 w-4 shrink-0 text-amber-deep" aria-hidden="true" />
            {{ item }}
          </li>
        </ul>
      </div>
    </section>

    <section class="py-12">
      <h2 class="text-2xl font-display font-semibold mb-6">What you get</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="s in services"
          :key="s.title"
          class="surface-card p-5"
        >
          <div class="w-9 h-9 rounded-card bg-amber/10 flex items-center justify-center mb-3.5">
            <component :is="s.icon" class="h-4.5 w-4.5 text-amber-deep" aria-hidden="true" />
          </div>
          <h4 class="font-semibold text-[15px] mb-2">{{ s.title }}</h4>
          <p class="text-sm text-ink-soft">{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <section class="py-12 border-t border-line">
      <h2 class="text-2xl font-display font-semibold mb-6">Frequently asked</h2>
      <div class="grid sm:grid-cols-2 gap-x-8 gap-y-6">
        <div v-for="f in faqs" :key="f.q">
          <h4 class="font-semibold text-[15px] mb-1.5">{{ f.q }}</h4>
          <p class="text-sm text-ink-soft">{{ f.a }}</p>
        </div>
      </div>
    </section>

    <section class="pt-6 border-t border-line">
      <h2 class="text-xl font-display font-semibold mb-3">Get in touch</h2>
      <p class="text-ink-soft text-sm flex items-center gap-2">
        <MapPin class="h-4 w-4" aria-hidden="true" />
        Phnom Penh, Cambodia
      </p>
      <p class="text-ink-soft text-sm mt-1.5 flex items-center gap-2">
        <Phone class="h-4 w-4" aria-hidden="true" />
        +855 89 416 985
      </p>
    </section>
  </div>
</template>
