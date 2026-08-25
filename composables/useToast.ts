export interface Toast {
  id: number
  message: string
  tone: 'success' | 'info' | 'error'
}

function toastState() {
  return useState<Toast[]>('toasts', () => [])
}

let counter = 0

export function useToast() {
  const toasts = toastState()

  function push(message: string, tone: Toast['tone'] = 'success') {
    const id = ++counter
    toasts.value = [...toasts.value, { id, message, tone }]
    if (import.meta.client) {
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 3000)
    }
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, push, dismiss }
}
