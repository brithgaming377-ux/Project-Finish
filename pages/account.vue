<script setup lang="ts">
import { books } from '~/data/books'

const savedIds = ref<number[]>([1, 9, 16])
const savedBooks = computed(() => books.filter(b => savedIds.value.includes(b.id)))

function remove(id: number) {
  savedIds.value = savedIds.value.filter(i => i !== id)
}
</script>

<template>
  <div class="container account">
    <header class="account-head">
      <div>
        <p class="eyebrow">Your account</p>
        <h1>Welcome back, Reader.</h1>
      </div>
      <NuxtLink to="/login" class="btn btn-ghost">Sign out</NuxtLink>
    </header>

    <section class="profile-card">
      <div class="avatar" aria-hidden="true">R</div>
      <div>
        <p class="name">Reader Account</p>
        <p class="email">reader@marginalia.app</p>
      </div>
      <span class="badge">Free member</span>
    </section>

    <section class="saved">
      <div class="saved-head">
        <h2>Saved books</h2>
        <p class="saved-count">{{ savedBooks.length }} saved</p>
      </div>

      <div v-if="savedBooks.length" class="saved-grid">
        <div v-for="book in savedBooks" :key="book.id" class="saved-item">
          <div class="chip-cover" :style="{ background: book.spineColor }" />
          <div class="saved-meta">
            <p class="title">{{ book.title }}</p>
            <p class="author">{{ book.author }}</p>
          </div>
          <button class="remove" type="button" @click="remove(book.id)" :aria-label="`Remove ${book.title} from saved`">
            Remove
          </button>
        </div>
      </div>
      <p v-else class="empty">
        Nothing saved yet. Browse the <NuxtLink to="/#catalog">catalog</NuxtLink> and save a few titles.
      </p>
    </section>
  </div>
</template>

<style scoped>
.account {
  padding: 56px 24px 80px;
  max-width: 760px;
}

.account-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.account-head h1 {
  font-size: 28px;
  margin-top: 8px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px 20px;
  margin-bottom: 40px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--parchment);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  flex-shrink: 0;
}

.name {
  font-weight: 600;
  font-size: 15px;
}

.email {
  font-size: 13.5px;
  color: var(--ink-soft);
}

.badge {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: var(--parchment-dim);
  border: 1px solid var(--line);
  padding: 5px 10px;
  border-radius: 999px;
  color: var(--ink-soft);
}

.saved-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}

.saved-head h2 {
  font-size: 20px;
}

.saved-count {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-soft);
}

.saved-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saved-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 12px 14px;
}

.chip-cover {
  width: 34px;
  height: 44px;
  border-radius: 3px;
  flex-shrink: 0;
}

.saved-meta {
  flex: 1;
}

.saved-meta .title {
  font-size: 14px;
  font-weight: 600;
}

.saved-meta .author {
  font-size: 12.5px;
  color: var(--ink-soft);
}

.remove {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 6px 12px;
  font-size: 12.5px;
  color: var(--ink-soft);
}

.remove:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.empty {
  color: var(--ink-soft);
  font-size: 14.5px;
}

.empty a {
  color: var(--amber-deep);
  text-decoration: underline;
}
</style>
