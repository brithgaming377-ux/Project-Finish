<script setup lang="ts">
defineProps<{
  categories: readonly string[]
  active: string
}>()

const emit = defineEmits<{ select: [category: string] }>()

function chipClass(isActive: boolean) {
  return isActive
    ? 'bg-ink text-parchment border-ink'
    : 'bg-white text-ink-soft border-line hover:border-ink'
}
</script>

<template>
  <div class="flex flex-wrap gap-2.5" role="tablist" aria-label="Book categories">
    <button
      class="font-mono text-xs px-4 py-2 rounded-full border transition"
      :class="chipClass(active === 'All')"
      role="tab"
      :aria-selected="active === 'All'"
      @click="emit('select', 'All')"
    >
      All
    </button>
    <button
      v-for="cat in categories"
      :key="cat"
      class="font-mono text-xs px-4 py-2 rounded-full border transition"
      :class="chipClass(active === cat)"
      role="tab"
      :aria-selected="active === cat"
      @click="emit('select', cat)"
    >
      {{ cat }}
    </button>
  </div>
</template>
