<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { login, register, isAdmin } = useAuth()
const { isClaimed, isAdminDevice, hasPendingRequest, claim, requestAdmin } = useAdminAccess()
const { push } = useToast()

const mode = ref<'login' | 'register'>('login')
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

const showRequest = ref(false)
const requestName = ref('')
const requestEmail = ref('')
const requestBusy = ref(false)
const requestError = ref('')
const claimBusy = ref(false)

function redirectTarget() {
  const target = route.query.redirect
  if (typeof target === 'string' && target.startsWith('/')) return target
  return isAdmin.value ? '/admin' : '/account'
}

function onSubmit() {
  error.value = ''
  const result =
    mode.value === 'login'
      ? login(email.value, password.value)
      : register(name.value, email.value, password.value)

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
}

async function onClaim() {
  claimBusy.value = true
  try {
    await claim()
    push('This computer is now the library owner.')
  } catch (err: any) {
    push(err?.data?.statusMessage || 'Could not claim ownership.', 'error')
  } finally {
    claimBusy.value = false
  }
}

async function onSubmitRequest() {
  requestError.value = ''
  requestBusy.value = true
  try {
    await requestAdmin(requestName.value || name.value, requestEmail.value || email.value)
    showRequest.value = false
    push('Admin request sent. The owner must approve it.')
  } catch (err: any) {
    requestError.value = err?.data?.statusMessage || 'Could not send request.'
  } finally {
    requestBusy.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[72vh] items-center justify-center px-6 py-16">
    <div class="surface-card w-full max-w-[460px] p-8 shadow-premium sm:p-10">
      <p class="page-eyebrow">ETEC-LIBRARY account</p>
      <h1 class="page-title text-4xl">{{ mode === 'login' ? 'Welcome back' : 'Create your account' }}</h1>
      <p class="mt-2 text-sm text-ink-soft">{{ mode === 'login' ? 'Sign in with the email and password you registered.' : 'Readers can register freely. Admin access is granted by the owner.' }}</p>

      <div class="mt-6 grid grid-cols-2 rounded-xl bg-parchment-dim p-1">
        <button type="button" class="rounded-lg py-2 text-sm font-semibold" :class="mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'" @click="switchMode('login')">Log in</button>
        <button type="button" class="rounded-lg py-2 text-sm font-semibold" :class="mode === 'register' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'" @click="switchMode('register')">Register</button>
      </div>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="onSubmit">
        <label v-if="mode === 'register'" class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Name</span><input v-model.trim="name" type="text" autocomplete="name" placeholder="Your name" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Email</span><input v-model.trim="email" type="email" autocomplete="email" placeholder="you@example.com" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Password</span><input v-model="password" type="password" autocomplete="current-password" :placeholder="mode === 'register' ? 'At least 6 characters' : 'Your password'" class="rounded-card border border-line bg-parchment-dim px-3 py-2.5 text-sm font-normal" /></label>

        <p v-if="error" class="text-[13px] text-rose" role="alert">{{ error }}</p>
        <button type="submit" class="mt-1 w-full rounded-card bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-light">{{ mode === 'login' ? 'Log in' : 'Create reader account' }}</button>
      </form>

      <!-- Owner setup -->
      <div v-if="!isClaimed && !isAdminDevice" class="mt-6 rounded-xl border border-amber/50 bg-amber/5 p-4">
        <p class="text-sm font-semibold text-ink">Make this computer the owner</p>
        <p class="mt-1 text-xs text-ink-soft">No owner has been set yet. Claim this device to become the sole admin and approve other admin requests.</p>
        <button type="button" class="mt-3 w-full rounded-card bg-amber-deep px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" :disabled="claimBusy" @click="onClaim">
          {{ claimBusy ? 'Claiming…' : 'Claim ownership on this computer' }}
        </button>
      </div>

      <!-- Admin request -->
      <div v-else-if="!isAdminDevice && !hasPendingRequest" class="mt-6 rounded-xl border border-line bg-parchment-dim p-4">
        <p class="text-sm font-semibold text-ink">Need admin access?</p>
        <p class="mt-1 text-xs text-ink-soft">Admin rights are approved by the owner. Send a request and wait for approval.</p>
        <button v-if="!showRequest" type="button" class="mt-3 w-full rounded-card border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white" @click="showRequest = true">Request admin access</button>
        <form v-else class="mt-3 flex flex-col gap-3" @submit.prevent="onSubmitRequest">
          <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Name</span><input v-model.trim="requestName" type="text" placeholder="Your name" class="rounded-card border border-line bg-white px-3 py-2 text-sm font-normal" /></label>
          <label class="flex flex-col gap-1.5 text-[13px] font-semibold"><span>Email</span><input v-model.trim="requestEmail" type="email" placeholder="you@example.com" class="rounded-card border border-line bg-white px-3 py-2 text-sm font-normal" /></label>
          <p v-if="requestError" class="text-[13px] text-rose" role="alert">{{ requestError }}</p>
          <div class="flex gap-2">
            <button type="submit" class="flex-1 rounded-card bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-light" :disabled="requestBusy">{{ requestBusy ? 'Sending…' : 'Send request' }}</button>
            <button type="button" class="rounded-card border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft" @click="showRequest = false">Cancel</button>
          </div>
        </form>
      </div>

      <p v-else-if="hasPendingRequest" class="mt-6 rounded-xl border border-line bg-parchment-dim p-4 text-center text-sm text-ink-soft">Your admin request is awaiting the owner's approval.</p>
    </div>
  </div>
</template>
