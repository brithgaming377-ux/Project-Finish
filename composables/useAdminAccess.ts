import { useDeviceId } from './useDeviceId'

export interface AdminRequest {
  deviceId: string
  name: string
  email: string
  requestedOn: string
}

export interface AdminConfig {
  ownerDeviceId: string
  admins: string[]
  requests: AdminRequest[]
}

export function useAdminAccess() {
  const deviceId = useDeviceId()
  const config = useState<AdminConfig>('admin-config', () => ({ ownerDeviceId: '', admins: [], requests: [] }))
  const loaded = useState<boolean>('admin-config-loaded', () => false)
  const loading = useState<boolean>('admin-config-loading', () => false)

  async function refresh() {
    if (!import.meta.client) return
    if (loading.value) return
    loading.value = true
    try {
      const data = await $fetch<AdminConfig>('/api/admin/config', { query: { deviceId: deviceId.value } })
      config.value = data
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const isAdminDevice = computed(() => loaded.value && (config.value.ownerDeviceId === deviceId.value || config.value.admins.includes(deviceId.value)))
  const isOwnerDevice = computed(() => loaded.value && config.value.ownerDeviceId === deviceId.value)
  const isClaimed = computed(() => loaded.value && Boolean(config.value.ownerDeviceId))
  const requests = computed(() => config.value.requests)
  const hasPendingRequest = computed(() => config.value.requests.some((request) => request.deviceId === deviceId.value))

  async function claim() {
    await $fetch('/api/admin/claim', { method: 'POST', body: { deviceId: deviceId.value } })
    await refresh()
  }

  async function requestAdmin(name: string, email: string) {
    await $fetch('/api/admin/request', { method: 'POST', body: { deviceId: deviceId.value, name, email } })
    await refresh()
  }

  async function approve(deviceId: string) {
    await $fetch('/api/admin/approve', { method: 'POST', body: { deviceId, approverDeviceId: deviceIdOfOwner() } })
    await refresh()
  }

  async function deny(deviceId: string) {
    await $fetch('/api/admin/deny', { method: 'POST', body: { deviceId, approverDeviceId: deviceIdOfOwner() } })
    await refresh()
  }

  function deviceIdOfOwner() {
    return config.value.ownerDeviceId
  }

  if (import.meta.client && !loaded.value) {
    refresh()
  }

  return {
    config,
    loaded,
    loading,
    isAdminDevice,
    isOwnerDevice,
    isClaimed,
    requests,
    hasPendingRequest,
    refresh,
    claim,
    requestAdmin,
    approve,
    deny
  }
}
