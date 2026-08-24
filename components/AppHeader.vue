<script setup lang="ts">
const route = useRoute()
const links = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'About Us', to: '/about' },
  { label: 'Account', to: '/account' }
]
const mobileOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-20 bg-parchment">
    <!-- Utility bar -->
    <div class="hidden sm:block border-b border-line bg-ink text-parchment/80">
      <div class="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs font-mono py-1.5">
        <span>Royal digital library catalog &middot; free access for all students</span>
        <div class="flex items-center gap-4">
          <NuxtLink to="/about" class="hover:text-parchment">Help</NuxtLink>
          <NuxtLink to="/login" class="hover:text-parchment">Staff login</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main nav -->
    <div class="border-b border-line">
      <div class="max-w-6xl mx-auto px-6 flex items-center gap-8 py-4">
        <NuxtLink to="/" class="flex items-center gap-2 mr-auto shrink-0">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <path d="M2 5.5C5 4 9 4 13 5.5V21.5C9 20 5 20 2 21.5V5.5Z" fill="#1B1F3B" />
            <path d="M24 5.5C21 4 17 4 13 5.5V21.5C17 20 21 20 24 21.5V5.5Z" fill="#E8A33D" />
          </svg>
          <span class="font-display font-semibold text-xl">Marginalia</span>
        </NuxtLink>

        <nav class="hidden md:flex gap-7" aria-label="Primary">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium pb-1 border-b-2"
            :class="route.path === link.to ? 'text-ink border-amber' : 'text-ink-soft border-transparent hover:text-ink'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <NuxtLink
          to="/login"
          class="hidden sm:inline-flex items-center gap-2 rounded-card bg-ink text-parchment font-semibold text-sm px-5 py-2.5 hover:bg-ink-light transition"
        >
          Log in
        </NuxtLink>

        <button
          class="md:hidden p-2 text-ink"
          type="button"
          aria-label="Toggle menu"
          @click="mobileOpen = !mobileOpen"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileOpen" class="md:hidden border-t border-line px-6 py-4 flex flex-col gap-3">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium"
          :class="route.path === link.to ? 'text-ink' : 'text-ink-soft'"
          @click="mobileOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
        <NuxtLink to="/login" class="text-sm font-semibold text-amber-deep" @click="mobileOpen = false">Log in</NuxtLink>
      </div>
    </div>
  </header>
</template>
