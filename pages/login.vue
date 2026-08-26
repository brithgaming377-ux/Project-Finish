<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { login, register } = useAuth()
const { push } = useToast()

const mode = ref<'login' | 'register'>('login')
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref<'user' | 'admin'>('user')
const adminPassword = ref('')
const error = ref('')

function redirectTarget() {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') ? target : '/account'
}

function onSubmit() {
  error.value = ''
  const result = mode.value === 'login'
    ? login(email.value, password.value)
    : register(name.value, email.value, password.value, role.value, adminPassword.value)

  if (!result.ok) {
    error.value = result.error || 'Something went wrong.'
    return
  }

  push(mode.value === 'login' ? 'Signed in successfully.' : 'Account created successfully.')
  router.push(redirectTarget())
}

function switchMode(nextMode: 'login' | 'register') {
  mode.value = nextMode
  error.value = ''
  password.value = ''
  adminPassword.value = ''
}
</script>

<template>
  <div class="flex min-h-[72vh] items-center justify-center px-6 py-16">
    <div class="surface-card w-full max-w-[460px] p-8 shadow-premium sm:p-10">
      <p class="page-eyebrow">ETEC-LIBRARY account</p>
      <h1 class="page-title text-4xl">{{ mode === 'login' ? 'Welcome back' : 'Create your account' }}</h1>
      <p class="mt-2 text-sm text-ink-soft">{{ mode === 'login' ? 'Sign in with the email and password you registered.' : 'Readers can register freely. Admin access requires the setup password.' }}</p>

      <div class="mt-6 grid grid-cols-2 rounded-xl bg-parchment-dim p-1">
        <button type="button" class="rounded-lg py-2 text-sm font-semibold" :class="mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'" @click="switchMode('login')">Log in</button>
        <button type="button" class="rounded-lg py-2 text-sm font-semibold" :class="mode === 'register' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'" @click="switchMode('register')">Register</button>
      </div>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="onSubmit">
        <label v-if="mode === 'register'" class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Name</span><input v-model.trim="name" type="text" autocomplete="name" placeholder="Your name" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Email</span><input v-model.trim="email" type="email" autocomplete="email" placeholder="you@example.com" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Password</span><input v-model="password" type="password" autocomplete="current-password" :placeholder="mode === 'register' ? 'At least 6 characters' : 'Your password'" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>

        <template v-if="mode === 'register'">
          <fieldset class="flex flex-col gap-2 text-[13px] font-semibold"><span>Account type</span><div class="grid grid-cols-2 gap-2"><label class="cursor-pointer rounded-xl border p-3" :class="role === 'user' ? 'border-ink bg-parchment-dim' : 'border-line'"><input v-model="role" type="radio" value="user" class="sr-only" /><span class="block text-sm">Reader</span><span class="mt-1 block text-xs font-normal text-ink-soft">Read and manage your library.</span></label><label class="cursor-pointer rounded-xl border p-3" :class="role === 'admin' ? 'border-amber-deep bg-amber/10' : 'border-line'"><input v-model="role" type="radio" value="admin" class="sr-only" /><span class="block text-sm">Admin</span><span class="mt-1 block text-xs font-normal text-ink-soft">Manage books and stock.</span></label></div></fieldset>
          <label v-if="role === 'admin'" class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Admin registration password</span><input v-model="adminPassword" type="password" autocomplete="off" placeholder="Enter the admin setup password" class="rounded-card border border-amber/60 bg-amber/5 px-3 py-2.5 text-sm font-normal" /><span class="text-xs font-normal text-ink-soft">Ask the library owner for this password.</span></label>
        </template>

        <p v-if="error" class="text-[13px] text-rose" role="alert">{{ error }}</p>
        <button type="submit" class="mt-1 w-full rounded-card bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-light">{{ mode === 'login' ? 'Log in' : `Create ${role === 'admin' ? 'admin' : 'reader'} account` }}</button>
      </form>
    </div>
  </div>
</template>
