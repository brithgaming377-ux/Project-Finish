<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-20 bg-ink pt-14 text-parchment">
    <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-10 sm:grid-cols-3">
      <div>
        <span class="font-display text-2xl">ETEC-LIBRARY</span>
        <p class="mt-3 max-w-xs text-sm leading-relaxed text-parchment/60">
          A free digital library and catalog. Learning anywhere, anytime.
        </p>
      </div>

      <div>
        <h4 class="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-amber">
          Quick links
        </h4>
        <div class="flex flex-col gap-2 text-sm text-parchment/75">
          <NuxtLink to="/" class="hover:text-parchment">Home</NuxtLink>
          <NuxtLink to="/products" class="hover:text-parchment">Products</NuxtLink>
          <NuxtLink to="/about" class="hover:text-parchment">About</NuxtLink>
        </div>
      </div>

      <div>
        <h4 class="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-amber">Contact</h4>
        <p class="text-sm text-parchment/75">Phnom Penh, Cambodia</p>
        <p class="text-sm text-parchment/75 mt-1">+855 89 416 985</p>
      </div>
    </div>
    <div class="border-t border-parchment/10 py-4">
      <p class="max-w-6xl mx-auto px-6 text-xs text-parchment/50">
        &copy; {{ year }} Marginalia E-Library. Built for learning.
      </p>
    </div>
  </footer>
</template>
