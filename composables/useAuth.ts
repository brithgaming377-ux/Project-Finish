export type Role = 'super-admin' | 'admin' | 'user'

export interface AuthUser {
  name: string
  email: string
  role: Role
}

interface StoredAccount extends AuthUser {
  password: string
}

interface AuthResult {
  ok: boolean
  error?: string
}

const SESSION_KEY = 'etec-library:auth-session'
const SESSION_VERSION = 2

function authState() {
  return useState<AuthUser | null>('auth-user', () => null)
}

function loadSession() {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    const session = raw ? JSON.parse(raw) : null
    if (session?.version === SESSION_VERSION && session.user) authState().value = session.user
  } catch {
    authState().value = null
  }
}

function saveSession(user: AuthUser | null) {
  if (!import.meta.client) return
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify({ version: SESSION_VERSION, user }))
  else localStorage.removeItem(SESSION_KEY)
}

let hydrated = false

export function useAuth() {
  const user = authState()
  const adminAccess = useAdminAccess()

  onMounted(() => {
    if (hydrated) return
    hydrated = true
    loadSession()
  })

  async function tryAutoClaim(email: string) {
    try {
      await adminAccess.claim(email)
    } catch {
      // Owner already set (409) or config not reachable — ignore.
    }
  }

  async function register(name: string, email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase()
    if (!name.trim() || !normalizedEmail || !password) return { ok: false, error: 'Complete all required fields.' }
    if (!normalizedEmail.includes('@')) return { ok: false, error: 'Enter a valid email address.' }
    if (password.length < 6) return { ok: false, error: 'Password must contain at least 6 characters.' }

    try {
      const result = await $fetch<{ ok: boolean; already?: boolean }>('/api/accounts', {
        method: 'POST',
        body: { name: name.trim(), email: normalizedEmail, password }
      })

      if (result.already) return { ok: false, error: 'An account already uses this email.' }

      user.value = { name: name.trim(), email: normalizedEmail, role: 'user' }
      saveSession(user.value)

      await tryAutoClaim(normalizedEmail)
      return { ok: true }
    } catch (err: any) {
      return { ok: false, error: err?.data?.statusMessage || 'Registration failed.' }
    }
  }

  async function login(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase()

    try {
      const result = await $fetch<{ accounts: StoredAccount[] }>('/api/accounts/all')
      const account = result.accounts.find((item) => item.email === normalizedEmail)

      if (!account || account.password !== password) {
        return { ok: false, error: 'Email or password is incorrect.' }
      }

      user.value = { name: account.name, email: account.email, role: account.role }
      saveSession(user.value)

      await tryAutoClaim(account.email)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Unable to reach server. Try again.' }
    }
  }

  function logout() {
    user.value = null
    saveSession(null)
  }

  const isAdmin = computed(() => isLoggedIn.value && (user.value?.role === 'admin' || user.value?.role === 'super-admin' || adminAccess.isAdminDevice.value))
  const isOwner = computed(() => isLoggedIn.value && (user.value?.role === 'super-admin' || adminAccess.isOwnerDevice.value))
  const isLoggedIn = computed(() => user.value !== null)

  return { user, register, login, logout, isAdmin, isOwner, isLoggedIn }
}
