<script setup lang="ts">
import { BookOpen } from '@lucide/vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-20 border-t-4 border-amber bg-emerald-950 pt-16 text-emerald-50">
    <div class="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-12 sm:grid-cols-[1.4fr_.7fr_.8fr]">
      <div>
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-amber">
            <BookOpen class="h-5 w-5" stroke-width="1.8" aria-hidden="true" />
          </span>
          <span class="font-display text-2xl">E-LIBRARY</span>
        </div>
        <span class="mt-2 block font-mono text-[9px] uppercase tracking-[0.18em] text-amber">Digital knowledge centre</span>
        <p class="mt-4 max-w-xs text-sm leading-7 text-emerald-100/65">
          A free digital library and catalog. Learning anywhere, anytime.
        </p>
      </div>

      <div>
        <h4 class="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-amber">
          Explore
        </h4>
        <div class="flex flex-col gap-3 text-sm text-emerald-100/75">
          <NuxtLink to="/" class="hover:text-white">Home</NuxtLink>
          <NuxtLink to="/products" class="hover:text-white">Book collection</NuxtLink>
          <NuxtLink to="/subjects" class="hover:text-white">Academic shelves</NuxtLink>
          <NuxtLink to="/about" class="hover:text-white">About E-LIBRARY</NuxtLink>
        </div>
      </div>

      <div>
        <h4 class="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-amber">Visit & contact</h4>
        <p class="text-sm text-emerald-100/75">Phnom Penh, Cambodia</p>
        <p class="mt-1 text-sm text-emerald-100/75">+855 89 416 985</p>
      </div>
    </div>
    <div class="border-t border-emerald-100/15 py-4">
      <p class="mx-auto max-w-6xl px-6 text-xs text-emerald-100/50">
        &copy; {{ year }} Marginalia E-Library. Built for learning.
      </p>
    </div>
  </footer>
</template>
