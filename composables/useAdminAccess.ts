export interface AdminRequest {
  email: string
  name: string
  requestedOn: string
}

export interface AdminConfig {
  configured: boolean
  isOwner: boolean
  isAdmin: boolean
  hasPendingRequest: boolean
  requests: AdminRequest[]
}

export function useAdminAccess() {
  // Read the current user from the shared auth state without importing useAuth,
  // to avoid a circular dependency (useAuth already imports this composable).
  const user = useState<{ email?: string } | null>('auth-user', () => null)
  const email = computed(() => user.value?.email?.trim().toLowerCase() || '')

  const config = useState<AdminConfig>('admin-config', () => ({ configured: false, isOwner: false, isAdmin: false, hasPendingRequest: false, requests: [] }))
  const loaded = useState<boolean>('admin-config-loaded', () => false)
  const loading = useState<boolean>('admin-config-loading', () => false)

  async function refresh() {
    if (!import.meta.client) return
    if (loading.value) return
    loading.value = true
    try {
      const data = await $fetch<AdminConfig>('/api/admin/config', { query: { email: email.value } })
      config.value = data
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const isAdminDevice = computed(() => loaded.value && config.value.isAdmin)
  const isOwnerDevice = computed(() => loaded.value && config.value.isOwner)
  const isConfigured = computed(() => loaded.value && config.value.configured)
  const requests = computed(() => config.value.requests)
  const hasPendingRequest = computed(() => config.value.hasPendingRequest)

  async function claim(emailValue: string) {
    await $fetch('/api/admin/claim', { method: 'POST', body: { email: emailValue } })
    await refresh()
  }

  async function requestAdmin(name: string, emailValue: string) {
    await $fetch('/api/admin/request', { method: 'POST', body: { email: emailValue, name } })
    await refresh()
  }

  async function approve(emailValue: string) {
    await $fetch('/api/admin/approve', { method: 'POST', body: { email: emailValue, approverEmail: user.value?.email } })
    await refresh()
  }

  async function deny(emailValue: string) {
    await $fetch('/api/admin/deny', { method: 'POST', body: { email: emailValue, approverEmail: user.value?.email } })
    await refresh()
  }

  // Re-check whenever the signed-in account changes (e.g. after login/logout).
  watch(email, () => {
    if (email.value) refresh()
    else {
      config.value = { configured: false, isOwner: false, isAdmin: false, hasPendingRequest: false, requests: [] }
      loaded.value = false
    }
  })

  if (import.meta.client && !loaded.value) {
    refresh()
  }

  return {
    config,
    loaded,
    loading,
    isAdminDevice,
    isOwnerDevice,
    isConfigured,
    requests,
    hasPendingRequest,
    refresh,
    claim,
    requestAdmin,
    approve,
    deny
  }
}
