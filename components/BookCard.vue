<script setup lang="ts">
import type { Book } from '~/data/books'

defineProps<{ book: Book }>()
</script>

<template>
  <NuxtLink :to="`/products/${book.id}`" class="card">
    <div class="cover" :style="{ background: book.spineColor }">
      <span class="cover-title">{{ book.title }}</span>
      <span class="cover-pages">{{ book.pages }}p</span>
    </div>
    <div class="meta">
      <p class="title">{{ book.title }}</p>
      <p class="author">{{ book.author }}</p>
      <span class="category">{{ book.category }}</span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.card {
  display: block;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(27, 31, 59, 0.1);
}

.cover {
  height: 148px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px;
  color: var(--parchment);
  position: relative;
}

.cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(255,255,255,0.12), transparent 60%);
}

.cover-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  line-height: 1.25;
  position: relative;
}

.cover-pages {
  font-family: var(--font-mono);
  font-size: 11px;
  opacity: 0.8;
  position: relative;
}

.meta {
  padding: 14px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.author {
  font-size: 13px;
  color: var(--ink-soft);
  margin-bottom: 8px;
}

.category {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--amber-deep);
}
</style>
