<script setup lang="ts">
import { ArrowRight, BookOpen, Eye, EyeOff, LoaderCircle } from '@lucide/vue'

definePageMeta({ layout: 'default' })
const router = useRouter()
const { login, isAdmin } = useAuth()
const { push } = useToast()

const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)
const showPassword = ref(false)

async function onSubmit() {
  error.value = ''
  busy.value = true
  try {
    const result = await login(email.value, password.value)
    if (!result.ok) {
      error.value = result.error || 'Login failed.'
      return
    }
    if (!isAdmin.value) {
      error.value = 'This account is not an admin. Use your reader login, or request admin access from your account page.'
      return
    }
    push('Welcome back, admin.')
    router.push('/admin')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[72vh] items-center justify-center px-6 py-16">
    <div class="surface-card w-full max-w-[460px] p-8 shadow-premium sm:p-10">
      <div class="auth-brand" aria-label="E-LIBRARY admin">
        <span class="auth-brand-mark"><BookOpen class="h-5 w-5" stroke-width="1.8" aria-hidden="true" /></span>
        <span class="auth-brand-name">E-LIBRARY</span>
        <span class="auth-brand-caption">Admin access</span>
      </div>
      <p class="page-eyebrow mt-8">E-LIBRARY admin</p>
      <h1 class="page-title text-4xl">Admin sign in</h1>
      <p class="mt-2 text-sm text-ink-soft">
        Only accounts approved by the owner can sign in here. Your reader account will not work on this page.
      </p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="onSubmit">
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Email</span><input v-model.trim="email" type="email" autocomplete="email" placeholder="admin@example.com" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Password</span><span class="password-field"><input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Your password" class="w-full rounded-card border border-line bg-parchment-dim px-3 py-2.5 pr-11 text-sm font-normal" /><button type="button" class="password-toggle" :aria-label="showPassword ? 'Hide password' : 'Show password'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" class="h-4 w-4" aria-hidden="true" /><Eye v-else class="h-4 w-4" aria-hidden="true" /></button></span></label>

        <p v-if="error" class="text-[13px] text-rose" role="alert">{{ error }}</p>
        <button type="submit" class="auth-submit premium-interaction group mt-1 flex w-full items-center justify-center gap-2 rounded-card bg-ink px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-ink-light disabled:cursor-wait disabled:opacity-80" :disabled="busy">
          <LoaderCircle v-if="busy" class="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{{ busy ? 'Signing in' : 'Sign in as admin' }}</span>
          <ArrowRight v-if="!busy" class="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </form>

      <p class="mt-6 text-center text-xs text-ink-soft">
        Not an admin?
        <NuxtLink to="/login" class="text-amber-deep underline">Reader sign in</NuxtLink>
      </p>
    </div>
  </div>
</template>
