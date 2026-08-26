export interface Toast {
  id: number
  message: string
  tone: 'success' | 'info' | 'error'
  actionLabel?: string
  action?: () => void
}

function toastState() {
  return useState<Toast[]>('toasts', () => [])
}

let counter = 0

export function useToast() {
  const toasts = toastState()

  function push(
    message: string,
    tone: Toast['tone'] = 'success',
    action?: { label: string; run: () => void }
  ) {
    const id = ++counter
    toasts.value = [
      ...toasts.value,
      { id, message, tone, actionLabel: action?.label, action: action?.run }
    ]
    if (import.meta.client) {
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id)
      }, 3000)
    }
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, push, dismiss }
}
