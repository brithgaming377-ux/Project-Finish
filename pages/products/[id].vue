<script setup lang="ts">
import { getBookById, getRelatedBooks } from '~/data/books'

const route = useRoute()
const id = computed(() => Number(route.params.id))
const book = computed(() => getBookById(id.value))

// 404 if the id doesn't match any book
if (!book.value) {
  throw createError({ statusCode: 404, statusMessage: 'Book not found', fatal: true })
}

const related = computed(() => book.value ? getRelatedBooks(book.value) : [])

useHead(() => ({
  title: book.value ? `${book.value.title} — Marginalia` : 'Marginalia'
}))

const saved = ref(false)
</script>

<template>
  <div v-if="book" class="container detail">
    <NuxtLink to="/products" class="back">&larr; Back to catalog</NuxtLink>

    <div class="layout">
      <div class="cover-wrap">
        <div class="cover" :style="{ background: book.spineColor }">
          <span class="cover-title">{{ book.title }}</span>
          <span class="cover-pages">{{ book.pages }}p</span>
        </div>
      </div>

      <div class="info">
        <span class="category">{{ book.category }}</span>
        <h1>{{ book.title }}</h1>
        <p class="author">by {{ book.author }}</p>

        <dl class="facts">
          <div>
            <dt>Published</dt>
            <dd>{{ book.year < 0 ? `${Math.abs(book.year)} BCE` : book.year }}</dd>
          </div>
          <div>
            <dt>Pages</dt>
            <dd>{{ book.pages }}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{{ book.category }}</dd>
          </div>
        </dl>

        <p class="description">{{ book.description }}</p>

        <div class="actions">
          <button
            class="btn"
            :class="saved ? 'btn-ghost' : 'btn-amber'"
            type="button"
            @click="saved = !saved"
          >
            {{ saved ? 'Saved ✓' : 'Save to my account' }}
          </button>
          <NuxtLink to="/products" class="btn btn-ghost">Browse more</NuxtLink>
        </div>
      </div>
    </div>

    <section v-if="related.length" class="related">
      <h2>More in {{ book.category }}</h2>
      <div class="grid">
        <BookCard v-for="b in related" :key="b.id" :book="b" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.detail {
  padding: 40px 24px 80px;
}

.back {
  display: inline-block;
  font-size: 13.5px;
  color: var(--ink-soft);
  margin-bottom: 24px;
}

.back:hover {
  color: var(--ink);
}

.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 48px;
}

.cover-wrap {
  position: sticky;
  top: 90px;
  align-self: start;
}

.cover {
  height: 340px;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px;
  color: var(--parchment);
  box-shadow: 0 10px 26px rgba(27, 31, 59, 0.16);
}

.cover-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 22px;
  line-height: 1.3;
}

.cover-pages {
  font-family: var(--font-mono);
  font-size: 12px;
  opacity: 0.85;
}

.category {
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--amber-deep);
}

.info h1 {
  font-size: clamp(26px, 3.6vw, 36px);
  margin-top: 10px;
}

.author {
  margin-top: 8px;
  color: var(--ink-soft);
  font-size: 15px;
}

.facts {
  display: flex;
  gap: 28px;
  margin: 24px 0 0;
  padding: 18px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.facts dt {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.facts dd {
  margin: 4px 0 0;
  font-weight: 600;
  font-size: 15px;
}

.description {
  margin-top: 24px;
  color: var(--ink-soft);
  font-size: 15px;
  max-width: 62ch;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.related {
  margin-top: 72px;
  padding-top: 32px;
  border-top: 1px solid var(--line);
}

.related h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.related .grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

@media (max-width: 700px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .cover-wrap {
    position: static;
    max-width: 220px;
  }
}
</style>
