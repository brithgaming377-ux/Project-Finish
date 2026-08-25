<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { login } = useAuth()
const { push } = useToast()

const name = ref('')
const email = ref('')
const role = ref<'user' | 'admin'>('user')
const error = ref('')

function redirectTarget() {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') ? target : '/account'
}

function onSubmit() {
  error.value = ''
  if (!name.value || !email.value) {
    error.value = 'Enter your name and email.'
    return
  }
  if (!email.value.includes('@')) {
    error.value = 'That email address doesn\u2019t look right.'
    return
  }
  login(name.value, email.value, role.value)
  push(`Signed in as ${role.value === 'admin' ? 'Admin' : 'Reader'}.`)
  router.push(redirectTarget())
}

function quickLogin(asRole: 'user' | 'admin') {
  const demo = asRole === 'admin'
    ? { name: 'Admin', email: 'admin@marginalia.app' }
    : { name: 'Reader', email: 'reader@marginalia.app' }
  login(demo.name, demo.email, asRole)
  push(`Signed in as ${asRole === 'admin' ? 'Admin' : 'Reader'} (demo).`)
  router.push(redirectTarget())
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-[400px] bg-white border border-line rounded-card shadow-premium p-8">
      <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">Welcome back</p>
      <h1 class="font-display font-semibold text-2xl mt-2">Log in to Marginalia</h1>
      <p class="text-[13.5px] text-ink-soft mt-2">This is a demo — no real password required.</p>

      <div class="flex gap-2 mt-6">
        <button
          type="button"
          class="flex-1 rounded-card border border-line py-2.5 text-sm font-semibold hover:border-ink transition"
          @click="quickLogin('user')"
        >
          Continue as Reader
        </button>
        <button
          type="button"
          class="flex-1 rounded-card border border-line py-2.5 text-sm font-semibold hover:border-ink transition"
          @click="quickLogin('admin')"
        >
          Continue as Admin
        </button>
      </div>

      <div class="flex items-center gap-3 my-6">
        <div class="h-px flex-1 bg-line" />
        <span class="text-xs text-ink-soft font-mono">or sign in manually</span>
        <div class="h-px flex-1 bg-line" />
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
          <span>Name</span>
          <input
            v-model="name"
            type="text"
            placeholder="Your name"
            class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-parchment-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          />
        </label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
          <span>Email</span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-parchment-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          />
        </label>

        <fieldset class="flex flex-col gap-1.5 text-[13px] font-semibold">
          <span>Role</span>
          <div class="flex gap-4 text-sm font-normal">
            <label class="flex items-center gap-1.5">
              <input v-model="role" type="radio" value="user" />
              Reader
            </label>
            <label class="flex items-center gap-1.5">
              <input v-model="role" type="radio" value="admin" />
              Admin
            </label>
          </div>
        </fieldset>

        <p v-if="error" class="text-[13px] text-rose" role="alert">{{ error }}</p>

        <button type="submit" class="w-full justify-center rounded-card bg-ink text-white font-semibold text-sm px-5 py-2.5 mt-1 hover:bg-ink-light transition">
          Log in
        </button>
      </form>
    </div>
  </div>
</template>
