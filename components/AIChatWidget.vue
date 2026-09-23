<script setup lang="ts">
import { Bot, Send, Sparkles, Trash2, X } from '@lucide/vue'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const prompt = ref('')
const isOpen = ref(false)
const isLoading = ref(false)
const route = useRoute()
const { user } = useAuth()
const currentBookId = computed(() => {
  if (!route.path.startsWith('/products/')) return undefined
  const id = Number(route.params.id)
  return Number.isInteger(id) ? id : undefined
})
const currentRole = computed(() => user.value?.role || 'guest')
const chatHistory = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: 'Hi! I can recommend books, compare titles, explain subjects, guide this page, and help with admin/library workflow decisions.'
  }
])

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const clearChat = () => {
  chatHistory.value = [
    {
      role: 'assistant',
      content: 'Hi! I can recommend books, compare titles, explain subjects, guide this page, and help with admin/library workflow decisions.'
    }
  ]
}

const sendMessage = async () => {
  const trimmed = prompt.value.trim()
  if (!trimmed || isLoading.value) return

  const userMessage = trimmed
  prompt.value = ''

  chatHistory.value.push({ role: 'user', content: userMessage })
  isLoading.value = true

  try {
    const response = await $fetch<{ reply?: string }>('/api/ai-chat', {
      method: 'POST',
      body: {
        message: userMessage,
        currentBookId: currentBookId.value,
        currentPath: route.path,
        userRole: currentRole.value,
        history: chatHistory.value.slice(0, -1).map((message) => ({
          role: message.role === 'user' ? 'user' : 'assistant',
          content: message.content
        }))
      }
    })

    chatHistory.value.push({
      role: 'assistant',
      content: response?.reply || 'Sorry, I could not generate a response.'
    })
  } catch (error: any) {
    chatHistory.value.push({
      role: 'assistant',
      content:
        error?.data?.statusMessage ||
        'The AI service is unavailable right now, but the library catalog is still available for recommendations and browsing.'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50">
    <div v-if="isOpen" class="mb-4 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white shadow-premium">
      <div class="flex items-center justify-between border-b border-line bg-ink px-4 py-3 text-white">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-amber">AI Assistant</p>
          <p class="text-sm font-semibold tracking-tight">E-LIBRARY Guide</p>
        </div>
        <div class="flex items-center gap-1">
          <button type="button" class="rounded-full p-1.5 hover:bg-white/10" @click="clearChat" aria-label="Clear chat" title="Clear chat">
            <Trash2 class="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" class="rounded-full p-1.5 hover:bg-white/10" @click="toggleChat" aria-label="Close AI assistant" title="Close assistant">
            <X class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="flex max-h-[420px] min-h-[320px] flex-col">
        <div class="flex-1 space-y-3 overflow-y-auto bg-parchment-dim p-4">
          <div
            v-for="(message, index) in chatHistory"
            :key="index"
            class="flex"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[75%] rounded-xl px-3 py-2 text-sm leading-6"
              :class="
                message.role === 'user'
                  ? 'bg-ink text-white'
                  : 'border border-line bg-white text-ink'
              "
            >
              {{ message.content }}
            </div>
          </div>

          <div v-if="isLoading" class="flex justify-start">
            <div class="rounded-2xl border border-line bg-white px-3 py-2 text-sm text-ink-soft">
              Thinking...
            </div>
          </div>
        </div>

        <form class="border-t border-line bg-white p-3" @submit.prevent="sendMessage">
          <div class="flex gap-2">
            <input
              v-model="prompt"
              type="text"
              placeholder="Ask about books or subjects..."
              class="w-full rounded-xl border border-line bg-parchment-dim px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              :disabled="isLoading"
            />
            <button
              type="submit"
              :disabled="isLoading || !prompt.trim()"
              class="flex items-center justify-center rounded-lg bg-amber px-3 py-2 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send message"
              title="Send message"
            >
              <Send class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>

    <button
      type="button"
      class="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-xl text-white shadow-premium transition hover:-translate-y-0.5 hover:bg-ink-light"
      @click="toggleChat"
      :aria-label="isOpen ? 'Close AI assistant' : 'Open AI assistant'"
      :title="isOpen ? 'Close AI assistant' : 'Open AI assistant'"
    >
      <X v-if="isOpen" class="h-6 w-6" aria-hidden="true" />
      <span v-else class="relative flex items-center justify-center">
        <Bot class="h-6 w-6" aria-hidden="true" />
        <Sparkles class="absolute -right-2 -top-2 h-3.5 w-3.5 text-amber" aria-hidden="true" />
      </span>
    </button>
  </div>
</template>
