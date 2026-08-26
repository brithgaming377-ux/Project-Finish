<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    rating: number
    count?: number
    size?: number
  }>(),
  {
    size: 14
  }
)

const pct = computed(() => `${Math.min(props.rating / 5, 1) * 100}%`)
</script>

<template>
  <span
    class="relative inline-flex items-center gap-1.5 leading-none"
    :style="{ fontSize: `${size}px` }"
  >
    <span class="relative">
      <span class="text-line tracking-[1px]" aria-hidden="true">★★★★★</span>
      <span
        class="absolute inset-0 overflow-hidden whitespace-nowrap text-amber-deep tracking-[1px]"
        :style="{ width: pct }"
        aria-hidden="true"
        >★★★★★</span
      >
    </span>
    <span class="sr-only">{{ rating }} out of 5 stars</span>
    <span v-if="count !== undefined" class="font-mono text-[0.85em] text-ink-soft"
      >({{ count }})</span
    >
  </span>
</template>
