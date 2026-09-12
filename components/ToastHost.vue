<script setup lang="ts">
import { CircleAlert, CircleCheck } from '@lucide/vue'

const { toasts, dismiss } = useToast()

function toneClasses(tone: string) {
  if (tone === 'error') return 'bg-rose text-white'
  return 'bg-ink text-white'
}

function runAction(id: number, action?: () => void) {
  action?.()
  dismiss(id)
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
        <CircleCheck v-if="t.tone === 'success'" class="h-4 w-4 shrink-0" aria-hidden="true" />
        <CircleAlert v-else-if="t.tone === 'error'" class="h-4 w-4 shrink-0" aria-hidden="true" />
        <span class="flex-1">{{ t.message }}</span>
        <button
          v-if="t.actionLabel"
          type="button"
          class="rounded-md border border-white/40 px-2 py-1 text-xs font-bold hover:bg-white/15"
          @click.stop="runAction(t.id, t.action)"
        >
          {{ t.actionLabel }}
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
