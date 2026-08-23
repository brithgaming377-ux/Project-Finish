<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="brand-text">Marginalia</span>
        <p class="tagline">Learning anywhere, anytime.</p>
      </div>

      <div class="footer-col">
        <h4>Quick Links</h4>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/products">Products</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </div>

      <div class="footer-col">
        <h4>Contact</h4>
        <p>Phnom Penh, Cambodia</p>
        <p>+855 89 416 985</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>&copy; {{ year }} Marginalia E-Library. Built for learning.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--ink);
  color: var(--parchment);
  margin-top: 80px;
  padding-top: 48px;
}

.footer-inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 32px;
  padding-bottom: 32px;
}

.footer-brand .brand-text {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
}

.tagline {
  color: rgba(247, 243, 232, 0.65);
  margin-top: 8px;
  font-size: 14px;
}

.footer-col h4 {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--amber);
  margin-bottom: 12px;
}

.footer-col a,
.footer-col p {
  display: block;
  font-size: 14px;
  color: rgba(247, 243, 232, 0.75);
  margin-bottom: 8px;
}

.footer-col a:hover {
  color: var(--parchment);
}

.footer-bottom {
  border-top: 1px solid rgba(247, 243, 232, 0.12);
  padding: 18px 0;
  font-size: 13px;
  color: rgba(247, 243, 232, 0.5);
}

@media (max-width: 640px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
