import { useAuth } from './useAuth'

export interface ManagedAccount {
  name: string
  email: string
  role: 'super-admin' | 'admin' | 'user'
  createdOn: string
}

export function useUserAdmin() {
  const { user } = useAuth()
  const accounts = useState<ManagedAccount[]>('admin-accounts', () => [])
  const count = useState<number>('admin-accounts-count', () => 0)
  const loaded = useState<boolean>('admin-accounts-loaded', () => false)
  const loading = useState<boolean>('admin-accounts-loading', () => false)

  async function refresh() {
    if (!import.meta.client) return
    if (loading.value) return
    loading.value = true
    try {
      const data = await $fetch<{ accounts: ManagedAccount[]; count: number }>('/api/accounts', {
        query: { email: user.value?.email || '' }
      })
      accounts.value = data.accounts
      count.value = data.count
      loaded.value = true
    } catch {
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function addAdmin(email: string) {
    await $fetch('/api/admin/add', {
      method: 'POST',
      body: { email, approverEmail: user.value?.email }
    })
    await refresh()
  }

  async function removeAdmin(email: string) {
    await $fetch('/api/admin/remove', {
      method: 'POST',
      body: { email, approverEmail: user.value?.email }
    })
    await refresh()
  }

  async function deleteReader(email: string) {
    await $fetch(`/api/accounts/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      body: { approverEmail: user.value?.email }
    })
    await refresh()
  }

  if (import.meta.client && !loaded.value) {
    refresh()
  }

  return { accounts, count, loaded, loading, refresh, addAdmin, removeAdmin, deleteReader }
}
