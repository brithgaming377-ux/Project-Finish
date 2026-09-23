<script setup lang="ts">
import { ArrowRight, BookOpen, Brain, FlaskConical, Globe2, Languages, Users } from '@lucide/vue'
import { subjects } from '~/data/subjects'
import { useCatalog } from '~/composables/useCatalog'

const { books } = useCatalog()

const subjectCounts = computed(() =>
  subjects.map((s) => ({ ...s, count: books.value.filter((b) => b.category === s.name).length }))
)
const subjectIcons = { technology: Brain, philosophy: BookOpen, science: FlaskConical, leadership: Users, language: Languages, history: Globe2, other: BookOpen }
</script>

<template>
  <div class="page-shell">
    <header class="mb-12 max-w-2xl">
      <p class="page-eyebrow">All subjects</p>
      <h1 class="page-title text-emerald-900">
        Every shelf in the library.
      </h1>
      <p class="page-description text-emerald-800/80">
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
          class="mb-4 flex h-11 w-11 items-center justify-center rounded-card border border-emerald-200"
          :style="{ background: s.color + '1a' }"
        >
          <component :is="subjectIcons[s.slug as keyof typeof subjectIcons]" class="h-5 w-5" :style="{ color: s.color }" aria-hidden="true" />
        </div>
        <h2 class="font-display text-lg font-semibold text-emerald-900">{{ s.name }}</h2>
        <p class="mt-1.5 text-sm text-emerald-700">{{ s.tagline }}</p>
        <div class="mt-4 flex items-center gap-1.5 font-mono text-xs text-emerald-700">
          <span>{{ s.count }} titles</span>
          <span>&middot;</span>
          <span class="inline-flex items-center gap-1 text-emerald-800 group-hover:underline">Browse shelf <ArrowRight class="h-3.5 w-3.5" aria-hidden="true" /></span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
