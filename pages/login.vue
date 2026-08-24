<script setup lang="ts">
const email = ref('')
const password = ref('')
const error = ref('')
const submitted = ref(false)

function onSubmit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Enter both your email and password.'
    return
  }
  if (!email.value.includes('@')) {
    error.value = 'That email address doesn\u2019t look right.'
    return
  }
  submitted.value = true
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-6 py-10">
    <div class="w-full max-w-[380px] bg-white border border-line rounded-card p-8">
      <p class="font-mono text-xs uppercase tracking-wide text-amber-deep">Welcome back</p>
      <h1 class="font-display font-semibold text-2xl mt-2">Log in to Marginalia</h1>
      <p class="text-[13.5px] text-ink-soft mt-2">Access your saved books and reading history.</p>

      <form v-if="!submitted" class="flex flex-col gap-4 mt-6" @submit.prevent="onSubmit">
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
          <span>Email</span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          />
        </label>
        <label class="flex flex-col gap-1.5 text-[13px] font-semibold">
          <span>Password</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            class="text-sm font-normal px-3 py-2.5 rounded-card border border-line bg-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          />
        </label>

        <p v-if="error" class="text-[13px] text-red-700" role="alert">{{ error }}</p>

        <button type="submit" class="w-full justify-center rounded-card bg-ink text-parchment font-semibold text-sm px-5 py-2.5 mt-1 hover:bg-ink-light transition">
          Log in
        </button>
      </form>

      <div v-else class="mt-6 text-center flex flex-col gap-3.5">
        <p class="text-sm">You're in — welcome back.</p>
        <NuxtLink to="/account" class="inline-flex justify-center rounded-card bg-amber text-ink font-semibold text-sm px-5 py-2.5 hover:bg-amber-deep transition">
          Go to your account
        </NuxtLink>
      </div>

      <p class="text-center text-[13px] text-ink-soft mt-5">
        New here? <NuxtLink to="/account" class="text-amber-deep font-semibold">Create a free account</NuxtLink>
      </p>
    </div>
  </div>
</template>
