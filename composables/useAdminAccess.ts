export interface AdminRequest {
  email: string
  name: string
  requestedOn: string
}

export interface AdminConfig {
  configured: boolean
  isOwner: boolean
  isSuperAdmin: boolean
  isAdmin: boolean
  hasPendingRequest: boolean
  requests: AdminRequest[]
}

export function useAdminAccess() {
  // Read the current user from the shared auth state without importing useAuth,
  // to avoid a circular dependency (useAuth already imports this composable).
  const user = useState<{ email?: string } | null>('auth-user', () => null)
  const email = computed(() => user.value?.email?.trim().toLowerCase() || '')

  const config = useState<AdminConfig>('admin-config', () => ({ configured: false, isOwner: false, isSuperAdmin: false, isAdmin: false, hasPendingRequest: false, requests: [] }))
  const loaded = useState<boolean>('admin-config-loaded', () => false)
  const loading = useState<boolean>('admin-config-loading', () => false)
  const refreshingEmail = useState<string>('admin-config-refreshing-email', () => '')

  async function refresh() {
    if (!import.meta.client) return

    const requestedEmail = email.value
    // A refresh can begin before the saved session is restored. Wait for that
    // request, then fetch again if it was for a different account.
    if (loading.value) {
      const wasRefreshingForRequestedEmail = refreshingEmail.value === requestedEmail
      await new Promise<void>((resolve) => {
        const stop = watch(loading, (isLoading) => {
          if (!isLoading) {
            stop()
            resolve()
          }
        })
      })
      if (wasRefreshingForRequestedEmail) return
      return refresh()
    }

    loading.value = true
    refreshingEmail.value = requestedEmail
    try {
      const data = await $fetch<AdminConfig>('/api/admin/config', { query: { email: requestedEmail } })
      config.value = data
      loaded.value = true
    } finally {
      loading.value = false
      refreshingEmail.value = ''
    }

    if (email.value !== requestedEmail) await refresh()
  }

  const isAdminDevice = computed(() => loaded.value && config.value.isAdmin)
  const isSuperAdminDevice = computed(() => loaded.value && config.value.isSuperAdmin)
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
      config.value = { configured: false, isOwner: false, isSuperAdmin: false, isAdmin: false, hasPendingRequest: false, requests: [] }
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
    isSuperAdminDevice,
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
