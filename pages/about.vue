<script setup lang="ts">
import { subjects } from '~/data/subjects'
import { useCatalog } from '~/composables/useCatalog'

const { books } = useCatalog()

const services = [
  {
    title: 'Read online',
    desc: 'Every title opens in the built-in reader — no app or download required.',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25'
  },
  {
    title: 'Borrow or buy',
    desc: 'Borrow a digital copy for two weeks, or buy a copy outright to keep permanently.',
    icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z'
  },
  {
    title: 'Exchange copies',
    desc: 'Trade a book you\u2019ve already borrowed for a different one, instantly.',
    icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
  },
  {
    title: 'Catalog records',
    desc: 'Every title has subjects, a call number, ISBN and a ready-made citation.',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25'
  }
]

const mission = [
  'Provide quality digital learning resources, free of charge',
  'Support students with textbooks and reference material for coursework',
  'Give every title a proper catalog record — subject, call number, citation',
  'Keep the catalog open to add, edit, or retire titles as the collection grows'
]

const faqs = [
  { q: 'Is Marginalia really free?', a: 'Reading and borrowing are always free. Buying a permanent copy is optional and shown on each book\u2019s page.' },
  { q: 'How does borrowing work?', a: 'Borrowed books are due back in 14 days. You can return early, or exchange a borrowed book for another eligible title.' },
  { q: 'Can I read without an account?', a: 'Browsing the catalog is open to everyone. Saving, borrowing, buying, and reading require a free account.' },
  { q: 'Who can add books to the catalog?', a: 'Catalog management is restricted to Admin accounts, who can add, edit, and remove titles.' }
]

const stats = computed(() => [
  { label: 'Titles catalogued', value: String(books.value.length) },
  { label: 'Subjects', value: String(subjects.length) },
  { label: 'Access', value: '24/7' },
  { label: 'Cost to read', value: 'Free' }
])
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-14 pb-20">
    <header class="max-w-[62ch] mb-12">
      <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">About Marginalia</p>
      <h1 class="font-display font-semibold text-[clamp(28px,4vw,42px)] mt-2.5">A library that fits in your pocket.</h1>
      <p class="text-ink-soft text-base mt-4">
        Marginalia is a digital library platform that gives students, teachers
        and researchers access to books and educational materials, catalogued
        and searchable like a university library — anytime, anywhere.
      </p>
    </header>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
      <div v-for="s in stats" :key="s.label" class="border border-line rounded-card bg-white p-4 text-center">
        <p class="font-display font-semibold text-2xl">{{ s.value }}</p>
        <p class="font-mono text-[11px] uppercase tracking-wide text-ink-soft mt-1">{{ s.label }}</p>
      </div>
    </div>

    <section class="grid sm:grid-cols-2 gap-8 py-8 border-t border-b border-line">
      <div>
        <h3 class="text-lg font-semibold mb-2.5">Our vision</h3>
        <p class="text-ink-soft text-sm">
          To become a trusted, free digital library that lowers the barrier
          to educational resources for anyone with an internet connection.
        </p>
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-2.5">Our mission</h3>
        <ul class="space-y-1.5">
          <li v-for="item in mission" :key="item" class="text-ink-soft text-sm flex gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" class="text-amber-deep shrink-0 mt-0.5"><path d="M4.5 12.75l6 6 9-13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ item }}
          </li>
        </ul>
      </div>
    </section>

    <section class="py-12">
      <h2 class="text-2xl font-display font-semibold mb-6">What you get</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="s in services" :key="s.title" class="bg-white border border-line rounded-card p-5">
          <div class="w-9 h-9 rounded-card bg-amber/10 flex items-center justify-center mb-3.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-amber-deep"><path :d="s.icon" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
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
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="1.6"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" stroke="currentColor" stroke-width="1.6"/></svg>
        Phnom Penh, Cambodia
      </p>
      <p class="text-ink-soft text-sm mt-1.5 flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a1.5 1.5 0 001.5-1.5v-1.372a1.5 1.5 0 00-1.06-1.436l-4.244-1.415a1.5 1.5 0 00-1.499.36l-.933.933a1.5 1.5 0 01-1.62.335 12.78 12.78 0 01-6.478-6.479 1.5 1.5 0 01.336-1.62l.932-.932a1.5 1.5 0 00.36-1.5L5.647 3.31A1.5 1.5 0 004.211 2.25H2.75a1.5 1.5 0 00-1.5 1.5v3z" stroke="currentColor" stroke-width="1.6"/></svg>
        +855 89 416 985
      </p>
    </section>
  </div>
</template>
