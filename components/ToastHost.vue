<script setup lang="ts">
const { toasts, dismiss } = useToast()

function toneClasses(tone: string) {
  if (tone === 'error') return 'bg-rose text-white'
  return 'bg-ink text-white'
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-xs">
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 translate-x-2"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="rounded-card shadow-premium px-4 py-3 text-sm font-medium flex items-center gap-2.5 cursor-pointer"
        :class="toneClasses(t.tone)"
        @click="dismiss(t.id)"
      >
        <svg v-if="t.tone === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" class="shrink-0"><path d="M4.5 12.75l6 6 9-13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <svg v-else-if="t.tone === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" class="shrink-0"><path d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>{{ t.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
