<script setup lang="ts">
import { books, categories } from '~/data/books'

const activeCategory = ref('All')
const query = ref('')

const filteredBooks = computed(() => {
  let list = activeCategory.value === 'All'
    ? books
    : books.filter(b => b.category === activeCategory.value)

  if (query.value.trim()) {
    const q = query.value.trim().toLowerCase()
    list = list.filter(b =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    )
  }
  return list
})

function selectCategory(cat: string) {
  activeCategory.value = cat
}
</script>

<template>
  <div class="container products">
    <header class="products-head">
      <p class="eyebrow">Full catalog</p>
      <h1>Products</h1>
      <p class="lead">Every book in Marginalia, in one place — filter by subject or search by title.</p>
    </header>

    <div class="controls">
      <CategoryChips
        :categories="categories"
        :active="activeCategory"
        @select="selectCategory"
      />
      <input
        v-model="query"
        type="search"
        class="search"
        placeholder="Search by title or author…"
        aria-label="Search books"
      />
    </div>

    <p class="count">Showing {{ filteredBooks.length }} of {{ books.length }} books</p>

    <div v-if="filteredBooks.length" class="grid">
      <BookCard v-for="book in filteredBooks" :key="book.id" :book="book" />
    </div>
    <p v-else class="empty">No books match “{{ query }}”. Try a different search or category.</p>
  </div>
</template>

<style scoped>
.products {
  padding: 56px 24px 80px;
}

.products-head {
  max-width: 60ch;
  margin-bottom: 32px;
}

.products-head h1 {
  font-size: clamp(28px, 4vw, 40px);
  margin-top: 8px;
}

.lead {
  margin-top: 12px;
  color: var(--ink-soft);
  font-size: 15px;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.search {
  font-family: var(--font-body);
  font-size: 13.5px;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink);
  min-width: 220px;
}

.search:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 1px;
}

.count {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--ink-soft);
  margin-top: 16px;
}

.grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 18px;
}

.empty {
  margin-top: 32px;
  color: var(--ink-soft);
  font-size: 14.5px;
}
</style>
