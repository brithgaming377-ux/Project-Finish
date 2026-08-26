export type Role = 'admin' | 'user'

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
const ACCOUNTS_KEY = 'etec-library:accounts'
const SESSION_VERSION = 2

// Change this value before sharing the project. For real security, validate it on a server.
export const ADMIN_REGISTRATION_PASSWORD = 'ETEC-ADMIN-2026'

function authState() {
  return useState<AuthUser | null>('auth-user', () => null)
}

function accountsState() {
  return useState<StoredAccount[]>('registered-accounts', () => [])
}

function loadAccounts() {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (raw) accountsState().value = JSON.parse(raw) as StoredAccount[]
  } catch {
    accountsState().value = []
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  if (!import.meta.client) return
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
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
  const accounts = accountsState()

  if (import.meta.client && !hydrated) {
    hydrated = true
    loadAccounts()
    loadSession()
  }

  function register(
    name: string,
    email: string,
    password: string,
    role: Role,
    adminPassword = ''
  ): AuthResult {
    const normalizedEmail = email.trim().toLowerCase()
    if (!name.trim() || !normalizedEmail || !password) return { ok: false, error: 'Complete all required fields.' }
    if (!normalizedEmail.includes('@')) return { ok: false, error: 'Enter a valid email address.' }
    if (password.length < 6) return { ok: false, error: 'Password must contain at least 6 characters.' }
    if (accounts.value.some((account) => account.email === normalizedEmail)) return { ok: false, error: 'An account already uses this email.' }
    if (role === 'admin' && adminPassword !== ADMIN_REGISTRATION_PASSWORD) return { ok: false, error: 'The admin registration password is incorrect.' }

    const account: StoredAccount = { name: name.trim(), email: normalizedEmail, password, role }
    accounts.value = [...accounts.value, account]
    saveAccounts(accounts.value)
    user.value = { name: account.name, email: account.email, role: account.role }
    saveSession(user.value)
    return { ok: true }
  }

  function login(email: string, password: string): AuthResult {
    const account = accounts.value.find((item) => item.email === email.trim().toLowerCase())
    if (!account || account.password !== password) return { ok: false, error: 'Email or password is incorrect.' }
    user.value = { name: account.name, email: account.email, role: account.role }
    saveSession(user.value)
    return { ok: true }
  }

  function logout() {
    user.value = null
    saveSession(null)
  }

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isLoggedIn = computed(() => user.value !== null)

  return { user, accounts, register, login, logout, isAdmin, isLoggedIn }
}
