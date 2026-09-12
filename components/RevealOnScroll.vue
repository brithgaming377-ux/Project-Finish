<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string
    delay?: number
  }>(),
  {
    as: 'div',
    delay: 0
  }
)

const element = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (!element.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isVisible.value = true
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        isVisible.value = true
        observer?.disconnect()
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )

  observer.observe(element.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <component
    :is="as"
    ref="element"
    class="reveal-on-scroll"
    :class="{ 'reveal-on-scroll-visible': isVisible }"
    :style="{ '--reveal-delay': `${delay}ms` }"
  >
    <slot />
  </component>
</template>
