<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string
    fallback: string
    alt: string
    label?: string
  }>(),
  { src: '', label: '' }
)

const activeSrc = ref(props.src || props.fallback)
const imageUnavailable = ref(!activeSrc.value)
const fallbackInitial = computed(
  () => (props.label || props.alt).trim().charAt(0).toUpperCase() || 'B'
)

watch(
  () => [props.src, props.fallback],
  () => {
    activeSrc.value = props.src || props.fallback
    imageUnavailable.value = !activeSrc.value
  }
)

function useFallback() {
  if (activeSrc.value !== props.fallback && props.fallback) {
    activeSrc.value = props.fallback
    return
  }
  imageUnavailable.value = true
}
</script>

<template>
  <div class="relative isolate" role="img" :aria-label="alt">
    <img
      v-if="!imageUnavailable"
      :src="activeSrc"
      :alt="alt"
      class="h-full w-full object-cover"
      @error="useFallback"
    />
    <div
      v-else
      class="flex h-full w-full flex-col justify-between bg-gradient-to-br from-white/25 via-white/10 to-ink/30 p-4 text-white"
    >
      <span class="font-mono text-[9px] uppercase tracking-[0.18em] text-white/75"
        >E-Library</span
      >
      <span class="font-display text-5xl leading-none">{{ fallbackInitial }}</span>
      <span class="h-px w-8 bg-white/50" />
    </div>
  </div>
</template>
