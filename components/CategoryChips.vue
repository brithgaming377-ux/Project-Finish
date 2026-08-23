<script setup lang="ts">
defineProps<{
  categories: readonly string[]
  active: string
}>()

const emit = defineEmits<{ select: [category: string] }>()
</script>

<template>
  <div class="chips" role="tablist" aria-label="Book categories">
    <button
      class="chip"
      :class="{ active: active === 'All' }"
      role="tab"
      :aria-selected="active === 'All'"
      @click="emit('select', 'All')"
    >
      All
    </button>
    <button
      v-for="cat in categories"
      :key="cat"
      class="chip"
      :class="{ active: active === cat }"
      role="tab"
      :aria-selected="active === cat"
      @click="emit('select', cat)"
    >
      {{ cat }}
    </button>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  font-family: var(--font-mono);
  font-size: 12.5px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-soft);
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.chip:hover {
  border-color: var(--ink);
}

.chip.active {
  background: var(--ink);
  color: var(--parchment);
  border-color: var(--ink);
}
</style>
