<script setup lang="ts">
const route = useRoute()
const links = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'About Us', to: '/about' },
  { label: 'Account', to: '/account' }
]
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <NuxtLink to="/" class="brand">
        <span class="brand-mark" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M2 5.5C5 4 9 4 13 5.5V21.5C9 20 5 20 2 21.5V5.5Z" fill="var(--ink)" />
            <path d="M24 5.5C21 4 17 4 13 5.5V21.5C17 20 21 20 24 21.5V5.5Z" fill="var(--amber)" />
          </svg>
        </span>
        <span class="brand-text">Marginalia</span>
      </NuxtLink>

      <nav class="nav" aria-label="Primary">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ active: route.path === link.to }"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <NuxtLink to="/login" class="btn btn-primary">Log in</NuxtLink>
    </div>
  </header>
</template>

<style scoped>
.header {
  border-bottom: 1px solid var(--line);
  background: var(--parchment);
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 32px;
  padding-top: 16px;
  padding-bottom: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: auto;
}

.brand-text {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
}

.nav {
  display: flex;
  gap: 28px;
}

.nav-link {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--ink-soft);
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
}

.nav-link:hover {
  color: var(--ink);
}

.nav-link.active {
  color: var(--ink);
  border-bottom-color: var(--amber);
}

@media (max-width: 640px) {
  .nav {
    display: none;
  }
}
</style>
