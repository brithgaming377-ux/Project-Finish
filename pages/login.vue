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
  <div class="container login">
    <div class="login-card">
      <p class="eyebrow">Welcome back</p>
      <h1>Log in to Marginalia</h1>
      <p class="sub">Access your saved books and reading history.</p>

      <form v-if="!submitted" class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" placeholder="you@example.com" />
        </label>
        <label class="field">
          <span>Password</span>
          <input v-model="password" type="password" autocomplete="current-password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
        </label>

        <p v-if="error" class="error" role="alert">{{ error }}</p>

        <button type="submit" class="btn btn-primary submit">Log in</button>
      </form>

      <div v-else class="success">
        <p>You're in — welcome back.</p>
        <NuxtLink to="/account" class="btn btn-amber">Go to your account</NuxtLink>
      </div>

      <p class="switch">
        New here? <NuxtLink to="/account">Create a free account</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 32px 28px;
}

.login-card h1 {
  font-size: 24px;
  margin-top: 8px;
}

.sub {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--ink-soft);
}

.form {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.field input {
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--parchment);
  color: var(--ink);
}

.field input:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 1px;
}

.error {
  font-size: 13px;
  color: #B3401E;
  margin: 0;
}

.submit {
  margin-top: 4px;
  width: 100%;
  justify-content: center;
}

.success {
  margin-top: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.switch {
  margin-top: 20px;
  font-size: 13px;
  color: var(--ink-soft);
  text-align: center;
}

.switch a {
  color: var(--amber-deep);
  font-weight: 600;
}
</style>
