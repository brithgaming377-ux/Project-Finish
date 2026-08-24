<script setup lang="ts">
const services = [
  { title: 'Online Reading', desc: 'Read thousands of books directly in your browser, no download required.' },
  { title: 'Downloads', desc: 'Save PDF/EPUB copies of eligible titles to read offline, anytime.' },
  { title: 'Free Membership', desc: 'Register a free account to track and save what you\u2019re reading.' },
  { title: 'Catalog Records', desc: 'Every title includes subjects, call numbers and citation info, like a real OPAC.' }
]

const mission = [
  'Provide quality digital learning resources',
  'Support students with free online books',
  'Reduce paper usage across campuses',
  'Build a modern, accessible library catalog'
]

const stats = [
  { label: 'Titles catalogued', value: '120+' },
  { label: 'Subjects', value: '7' },
  { label: 'Access', value: '24/7' },
  { label: 'Cost', value: 'Free' }
]
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
        <ul class="list-disc pl-4.5 space-y-1.5">
          <li v-for="item in mission" :key="item" class="text-ink-soft text-sm">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="py-12">
      <h2 class="text-2xl font-display font-semibold mb-6">What you get</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="s in services" :key="s.title" class="bg-white border border-line rounded-card p-5">
          <h4 class="font-semibold text-[15px] mb-2">{{ s.title }}</h4>
          <p class="text-sm text-ink-soft">{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <section class="pt-6 border-t border-line">
      <h2 class="text-xl font-display font-semibold mb-3">Get in touch</h2>
      <p class="text-ink-soft text-sm">Phnom Penh, Cambodia</p>
      <p class="text-ink-soft text-sm mt-1">+855 89 416 985</p>
    </section>
  </div>
</template>
