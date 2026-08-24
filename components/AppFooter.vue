<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-ink text-parchment mt-20 pt-12">
    <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8">
      <div>
        <span class="font-display font-semibold text-xl">Marginalia</span>
        <p class="text-parchment/60 text-sm mt-2">A free digital library and catalog. Learning anywhere, anytime.</p>
      </div>

      <div>
        <h4 class="font-mono text-xs uppercase tracking-wide text-amber mb-3">Quick links</h4>
        <div class="flex flex-col gap-2 text-sm text-parchment/75">
          <NuxtLink to="/" class="hover:text-parchment">Home</NuxtLink>
          <NuxtLink to="/products" class="hover:text-parchment">Products</NuxtLink>
          <NuxtLink to="/about" class="hover:text-parchment">About</NuxtLink>
        </div>
      </div>

      <div>
        <h4 class="font-mono text-xs uppercase tracking-wide text-amber mb-3">Contact</h4>
        <p class="text-sm text-parchment/75">Phnom Penh, Cambodia</p>
        <p class="text-sm text-parchment/75 mt-1">+855 89 416 985</p>
      </div>
    </div>
    <div class="border-t border-parchment/10 py-4">
      <p class="max-w-6xl mx-auto px-6 text-xs text-parchment/50">&copy; {{ year }} Marginalia E-Library. Built for learning.</p>
    </div>
  </footer>
</template>
