export type Role = 'admin' | 'user'

export interface AuthUser {
  name: string
  email: string
  role: Role
}

const STORAGE_KEY = 'marginalia:auth'

// Shared reactive state across the whole app (Nuxt's useState is SSR-safe
// and dedupes by key, so every component gets the same instance).
function authState() {
  return useState<AuthUser | null>('auth-user', () => null)
}

function loadFromStorage() {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) authState().value = JSON.parse(raw)
  } catch {
    // ignore corrupt storage
  }
}

function saveToStorage(user: AuthUser | null) {
  if (!import.meta.client) return
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore storage errors (private browsing, etc.)
  }
}

export function useAuth() {
  const user = authState()

  // Lazily hydrate from localStorage on first client-side use.
  if (import.meta.client && user.value === null) {
    loadFromStorage()
  }

  function login(name: string, email: string, role: Role) {
    user.value = { name, email, role }
    saveToStorage(user.value)
  }

  function logout() {
    user.value = null
    saveToStorage(null)
  }

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isLoggedIn = computed(() => user.value !== null)

  return { user, login, logout, isAdmin, isLoggedIn }
}
