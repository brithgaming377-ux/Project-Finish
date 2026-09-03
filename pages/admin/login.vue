<script setup lang="ts">
definePageMeta({ layout: 'default' })
const router = useRouter()
const { login, user } = useAuth()
const { push } = useToast()

const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function onSubmit() {
  error.value = ''
  busy.value = true
  try {
    const result = await login(email.value, password.value)
    if (!result.ok) {
      error.value = result.error || 'Login failed.'
      return
    }
    if (user.value?.role !== 'admin' && user.value?.role !== 'super-admin') {
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
      <p class="page-eyebrow">ETEC-LIBRARY admin</p>
      <h1 class="page-title text-4xl">Admin sign in</h1>
      <p class="mt-2 text-sm text-ink-soft">
        Only accounts approved by the owner can sign in here. Your reader account will not work on this page.
      </p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="onSubmit">
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Email</span><input v-model.trim="email" type="email" autocomplete="email" placeholder="admin@example.com" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Password</span><input v-model="password" type="password" autocomplete="current-password" placeholder="Your password" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>

        <p v-if="error" class="text-[13px] text-rose" role="alert">{{ error }}</p>
        <button type="submit" class="mt-1 w-full rounded-card bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-light" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in as admin' }}</button>
      </form>

      <p class="mt-6 text-center text-xs text-ink-soft">
        Not an admin?
        <NuxtLink to="/login" class="text-amber-deep underline">Reader sign in</NuxtLink>
      </p>
    </div>
  </div>
</template>
