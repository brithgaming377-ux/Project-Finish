<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, LoaderCircle } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const { login, register, user, isAdmin } = useAuth()
const { isConfigured } = useAdminAccess()
const { data: adminData } = useAdminLibrary()
const { push } = useToast()

const mode = ref<'login' | 'register'>('login')
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)

function redirectTarget() {
  const target = route.query.redirect
  if (typeof target === 'string' && target.startsWith('/')) return target
  return isAdmin.value ? '/admin' : '/account'
}

async function onSubmit() {
  error.value = ''
  if (mode.value === 'register' && !adminData.value.settings.allowRegistration) {
    error.value = 'New member registration is currently disabled.'
    return
  }
  isSubmitting.value = true
  try {
    const result = await (mode.value === 'login'
      ? login(email.value, password.value)
      : register(name.value, email.value, password.value))

    if (!result.ok) {
      error.value = result.error || 'Something went wrong.'
      return
    }

    push(mode.value === 'login' ? 'Signed in successfully.' : 'Account created successfully.')
    router.push(redirectTarget())
  } finally {
    isSubmitting.value = false
  }
}

function switchMode(nextMode: 'login' | 'register') {
  if (nextMode === 'register' && !adminData.value.settings.allowRegistration) {
    error.value = 'New member registration is currently disabled.'
    return
  }
  mode.value = nextMode
  error.value = ''
  password.value = ''
  showPassword.value = false
}
</script>

<template>
  <div class="flex min-h-[72vh] items-center justify-center px-6 py-16">
    <div class="surface-card motion-scale-in w-full max-w-[460px] p-8 shadow-premium sm:p-10">
      <div class="auth-brand" aria-label="DigitalLibrary">
        <img src="/images/digital-library-logo.png" alt="DigitalLibrary" class="h-32 w-32 rounded-full object-contain" />
      </div>
      <template v-if="mode === 'login'">
        <p class="page-eyebrow mt-8">E-LIBRARY account</p>
        <h1 class="page-title text-4xl">Welcome back</h1>
        <p class="mt-2 text-sm text-ink-soft">Sign in with the email and password you registered.</p>
      </template>

      <div class="auth-mode-switch mt-6 grid grid-cols-2 rounded-xl bg-parchment-dim p-1" role="tablist" aria-label="Account access mode">
        <span class="auth-mode-indicator" :class="{ 'auth-mode-indicator-register': mode === 'register' }" aria-hidden="true" />
        <button type="button" role="tab" :aria-selected="mode === 'login'" class="auth-mode-button" :class="{ 'auth-mode-button-active': mode === 'login' }" @click="switchMode('login')">Login</button>
        <button type="button" role="tab" :aria-selected="mode === 'register'" class="auth-mode-button" :class="{ 'auth-mode-button-active': mode === 'register' }" @click="switchMode('register')">Sign up</button>
      </div>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="onSubmit">
        <label v-if="mode === 'register'" class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Name</span><input v-model.trim="name" type="text" autocomplete="name" placeholder="Your name" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Email</span><input v-model.trim="email" type="email" autocomplete="email" placeholder="you@example.com" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Password</span><span class="password-field"><input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" :placeholder="mode === 'register' ? 'At least 6 characters' : 'Your password'" class="w-full rounded-card border border-line bg-parchment-dim px-3 py-2.5 pr-11 text-sm font-normal" /><button type="button" class="password-toggle" :aria-label="showPassword ? 'Hide password' : 'Show password'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" class="h-4 w-4" aria-hidden="true" /><Eye v-else class="h-4 w-4" aria-hidden="true" /></button></span></label>

        <p v-if="error" class="text-[13px] text-rose" role="alert">{{ error }}</p>
        <button type="submit" class="auth-submit premium-interaction group mt-1 flex w-full items-center justify-center gap-2 rounded-card bg-ink px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-ink-light disabled:cursor-wait disabled:opacity-80" :disabled="isSubmitting">
          <LoaderCircle v-if="isSubmitting" class="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{{ isSubmitting ? (mode === 'login' ? 'Signing in' : 'Creating account') : mode === 'login' ? 'Login' : 'Sign up' }}</span>
          <ArrowRight v-if="!isSubmitting" class="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </form>

      <p v-if="!isConfigured" class="mt-6 rounded-xl border border-amber/50 bg-amber/5 p-4 text-center text-xs text-ink-soft">
        No owner is set yet. After you log in, open your account page and click <strong>Claim ownership</strong> to become the admin.
      </p>

    </div>
  </div>
</template>
