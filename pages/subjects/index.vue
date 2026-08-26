<script setup lang="ts">
import { subjects } from '~/data/subjects'
import { useCatalog } from '~/composables/useCatalog'

const { books } = useCatalog()

const subjectCounts = computed(() =>
  subjects.map((s) => ({ ...s, count: books.value.filter((b) => b.category === s.name).length }))
)
</script>

<template>
  <div class="page-shell">
    <header class="mb-12 max-w-2xl">
      <p class="page-eyebrow">All subjects</p>
      <h1 class="page-title">
        Every shelf in the library.
      </h1>
      <p class="page-description">
        Each subject has its own page with a description, notable titles, and everything catalogued
        under it.
      </p>
    </header>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <NuxtLink
        v-for="s in subjectCounts"
        :key="s.slug"
        :to="`/subjects/${s.slug}`"
        class="surface-card group p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card"
      >
        <div
          class="w-11 h-11 rounded-card flex items-center justify-center mb-4"
          :style="{ background: s.color + '1a' }"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :style="{ color: s.color }">
            <path
              :d="s.icon"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="font-display font-semibold text-lg">{{ s.name }}</h2>
        <p class="text-sm text-ink-soft mt-1.5">{{ s.tagline }}</p>
        <div class="flex items-center gap-1.5 mt-4 text-xs font-mono text-ink-soft">
          <span>{{ s.count }} titles</span>
          <span>&middot;</span>
          <span class="text-amber-deep group-hover:underline">Browse shelf &rarr;</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
