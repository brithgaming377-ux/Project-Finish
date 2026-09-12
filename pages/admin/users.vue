<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
import { Search, Plus, Edit3, Trash2, Users, UserCheck, UserPlus, X, ShieldCheck, CalendarDays } from '@lucide/vue'

const { user: currentUser } = useAuth()
const { isSuperAdminDevice, isOwnerDevice } = useAdminAccess()
const { requests } = useRequests()
const { push: toast } = useToast()

interface ManagedUser {
  name: string
  email: string
  role: 'super-admin' | 'admin' | 'user'
  createdOn: string
}

const users = ref<ManagedUser[]>([])
const loading = ref(false)
const searchQuery = ref('')
const roleFilter = ref<'all' | 'super-admin' | 'admin' | 'user'>('all')

// Add user modal
const showAddModal = ref(false)
const addForm = reactive({ name: '', email: '', password: '', role: 'user' })
const addBusy = ref(false)

// Edit user modal
const editingUser = ref<ManagedUser | null>(null)
const editForm = reactive({ name: '', role: 'user' })
const editBusy = ref(false)

const canManageAdmins = computed(() => currentUser.value?.role === 'super-admin' || isSuperAdminDevice.value || isOwnerDevice.value)

function canDeleteUser(user: ManagedUser) {
  if (user.email === currentUser.value?.email || user.role === 'super-admin') return false
  return user.role === 'user' || canManageAdmins.value
}

function canEditUser(user: ManagedUser) {
  if (user.email === currentUser.value?.email) return false
  if (currentUser.value?.role === 'admin' && (user.role === 'admin' || user.role === 'super-admin')) return false
  return true
}

async function fetchUsers() {
  loading.value = true
  try {
    const result = await $fetch('/api/accounts', { query: { email: currentUser.value?.email } }) as any
    users.value = result.accounts || []
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
}

const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => {
    const matchesRole = roleFilter.value === 'all' || u.role === roleFilter.value
    const matchesSearch = !q || `${u.name} ${u.email}`.toLowerCase().includes(q)
    return matchesRole && matchesSearch
  })
})

const userStats = computed(() => {
  return {
    total: users.value.length,
    admins: users.value.filter(u => u.role === 'admin' || u.role === 'super-admin').length,
    readers: users.value.filter(u => u.role === 'user').length,
    superAdmins: users.value.filter(u => u.role === 'super-admin').length
  }
})

function roleLabel(role: ManagedUser['role']) {
  return role === 'super-admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Reader'
}

function getBorrowedCount(email: string) {
  return requests.value.filter(r => r.userEmail === email && r.kind === 'borrow' && r.status === 'approved').length
}

// Add user
function openAddModal() {
  showAddModal.value = true
  addForm.name = ''
  addForm.email = ''
  addForm.password = ''
  addForm.role = 'user'
}

async function addUser() {
  if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password) {
    toast('Please fill all fields.', 'error')
    return
  }
  addBusy.value = true
  try {
    await $fetch('/api/accounts', {
      method: 'POST',
      body: {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        password: addForm.password,
        role: addForm.role,
        approverEmail: currentUser.value?.email
      }
    })
    toast('User added successfully.')
    showAddModal.value = false
    await fetchUsers()
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not add user.', 'error')
  } finally {
    addBusy.value = false
  }
}

// Edit user
function startEdit(user: ManagedUser) {
  editingUser.value = user
  editForm.name = user.name
  editForm.role = user.role
}

function cancelEdit() {
  editingUser.value = null
  editForm.name = ''
  editForm.role = 'user'
}

async function saveEdit() {
  if (!editingUser.value) return
  editBusy.value = true
  try {
    await $fetch(`/api/accounts/${encodeURIComponent(editingUser.value.email)}`, {
      method: 'PUT',
      body: {
        approverEmail: currentUser.value?.email,
        name: editForm.name,
        role: editForm.role
      }
    })
    toast('User updated.')
    cancelEdit()
    await fetchUsers()
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not update user.', 'error')
  } finally {
    editBusy.value = false
  }
}

// Delete user
async function deleteUser(email: string) {
  const target = users.value.find(user => user.email === email)
  if (!target || !canDeleteUser(target)) {
    toast('You do not have permission to delete this account.', 'error')
    return
  }
  if (email === currentUser.value?.email) {
    toast('You cannot delete your own account.', 'error')
    return
  }
  if (!confirm(`Delete user "${email}"? This will remove the account from the library records.`)) return
  try {
    const result = await $fetch<{ ok: boolean; removed: boolean }>(`/api/accounts/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      body: { approverEmail: currentUser.value?.email }
    })
    if (!result.removed) {
      toast('Account was not found.', 'error')
      await fetchUsers()
      return
    }
    toast('User deleted from the account records.')
    await fetchUsers()
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Could not delete user.', 'error')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-7">
    <div class="relative overflow-hidden rounded-2xl bg-white px-6 py-7 text-slate-900 shadow-lg sm:px-8 border border-slate-200">
      <div class="relative z-10 flex flex-wrap items-end justify-between gap-5">
      <div>
        <div class="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c9a227]"><Users class="h-4 w-4" /> User management</div>
        <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">People with access</h1>
        <p class="mt-2 max-w-xl text-sm leading-6 text-slate-500">Manage readers, administrators, and the people who keep your digital library running.</p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-[#c9a227] px-4 py-2.5 text-sm font-semibold text-[#17192d] transition hover:bg-[#dfc45f]"
        @click="openAddModal"
      >
        <Plus class="h-4 w-4" /> Add user
      </button>
      </div>
      <div class="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[34px] border-[#c9a227]/10" />
      <div class="absolute bottom-0 right-24 h-1 w-28 bg-[#c9a227]" />
    </div>

    <!-- Stats -->
    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Users class="h-5 w-5" /></span>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total accounts</p>
            <p class="mt-1 text-2xl font-bold text-slate-900">{{ userStats.total }} <span class="text-xs font-medium text-slate-400">registered</span></p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><UserCheck class="h-5 w-5" /></span>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Administrators</p>
            <p class="mt-1 text-2xl font-bold text-slate-900">{{ userStats.admins }} <span class="text-xs font-medium text-slate-400">with access</span></p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 border-l-4 border-l-violet-500 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><UserPlus class="h-5 w-5" /></span>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Readers</p>
            <p class="mt-1 text-2xl font-bold text-slate-900">{{ userStats.readers }} <span class="text-xs font-medium text-slate-400">members</span></p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 border-l-4 border-l-[#c9a227] bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff8df] text-[#a6821a]"><ShieldCheck class="h-5 w-5" /></span>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Super admins</p>
            <p class="mt-1 text-2xl font-bold text-slate-900">{{ userStats.superAdmins }} <span class="text-xs font-medium text-slate-400">protected</span></p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div class="relative min-w-0 flex-1">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search by name or email..."
          class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div class="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
        <button
          v-for="filter in [{ value: 'all', label: 'All' }, { value: 'user', label: 'Readers' }, { value: 'admin', label: 'Admins' }, { value: 'super-admin', label: 'Super Admins' }]"
          :key="filter.value"
          type="button"
          class="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition"
          :class="roleFilter === filter.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
          @click="roleFilter = filter.value as any"
        >
          {{ filter.label }}
        </button>
      </div>
      </div>
      <p class="mt-3 px-1 text-xs text-slate-400">Showing <span class="font-semibold text-slate-600">{{ filteredUsers.length }}</span> of {{ users.length }} accounts</p>
    </section>

    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div><h2 class="font-semibold text-slate-900">Directory</h2><p class="mt-0.5 text-xs text-slate-400">Account activity and permissions</p></div>
        <CalendarDays class="h-5 w-5 text-slate-300" />
      </div>
      <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Loading users...</div>
      <div v-else-if="filteredUsers.length" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50">
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              <th class="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Borrowed</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in filteredUsers" :key="u.email" class="group transition-colors hover:bg-[#fffdf5]">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#17192d] text-sm font-semibold text-[#e2bf52]">{{ u.name?.[0]?.toUpperCase() || '?' }}</span>
                  <div>
                    <p class="text-sm font-medium text-slate-800">{{ u.name || 'Unnamed' }}</p>
                    <p class="mt-0.5 text-xs text-slate-400">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="{
                    'bg-amber-50 text-amber-700': u.role === 'super-admin',
                    'bg-blue-50 text-blue-700': u.role === 'admin',
                    'bg-slate-100 text-slate-600': u.role === 'user'
                  }"
                >
                  {{ roleLabel(u.role) }}
                </span>
              </td>
              <td class="px-5 py-4 text-center">
                <span class="text-sm font-semibold text-slate-700">{{ getBorrowedCount(u.email) }}</span>
              </td>
              <td class="px-5 py-4">
                <span class="text-sm text-slate-500">{{ u.createdOn }}</span>
              </td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-2">
                  <button
                    v-if="canEditUser(u)"
                    type="button"
                    class="rounded-lg border border-slate-200 p-2 text-slate-500 opacity-70 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 group-hover:opacity-100"
                    title="Edit"
                    @click="startEdit(u)"
                  >
                    <Edit3 class="h-4 w-4" />
                  </button>
                  <button
                    v-if="canDeleteUser(u)"
                    type="button"
                    class="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 transition"
                    title="Delete"
                    @click="deleteUser(u.email)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="p-8 text-center text-sm text-slate-500">No users found.</p>
    </section>

    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-[#17192d]/55 p-4 backdrop-blur-sm">
      <div class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div class="border-b border-slate-100 bg-[#17192d] px-6 py-5 text-white">
          <div class="flex items-center justify-between">
            <div><p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#e2bf52]">Directory</p><h3 class="mt-1 text-xl font-semibold">Add new user</h3></div>
          <button type="button" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100" @click="showAddModal = false">
            <X class="h-5 w-5" />
          </button>
          </div>
        </div>
        <form class="space-y-4 p-6" @submit.prevent="addUser">
          <label class="block text-sm font-medium">
            <span class="text-slate-700">Name</span>
            <input v-model="addForm.name" type="text" required placeholder="Full name" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label class="block text-sm font-medium">
            <span class="text-slate-700">Email</span>
            <input v-model="addForm.email" type="email" required placeholder="user@example.com" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label class="block text-sm font-medium">
            <span class="text-slate-700">Password</span>
            <input v-model="addForm.password" type="password" required placeholder="At least 6 characters" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label class="block text-sm font-medium">
            <span class="text-slate-700">Role</span>
            <select v-model="addForm.role" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="user">Reader</option>
              <option value="admin">Admin</option>
              <option value="super-admin">Super Admin</option>
            </select>
            <span class="mt-1.5 block text-xs font-normal text-slate-400">Super Admin has full control over users and library settings.</span>
          </label>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" @click="showAddModal = false">Cancel</button>
            <button type="submit" class="rounded-lg bg-[#17192d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" :disabled="addBusy">{{ addBusy ? 'Adding...' : 'Create account' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="editingUser" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-slate-900">Edit User</h3>
          <button type="button" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100" @click="cancelEdit">
            <X class="h-5 w-5" />
          </button>
        </div>
        <form class="space-y-4" @submit.prevent="saveEdit">
          <div class="rounded-lg bg-slate-50 p-3">
            <p class="text-sm font-medium text-slate-700">{{ editingUser.email }}</p>
          </div>
          <label class="block text-sm font-medium">
            <span class="text-slate-700">Name</span>
            <input v-model="editForm.name" type="text" required placeholder="Full name" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label class="block text-sm font-medium">
            <span class="text-slate-700">Role</span>
            <select v-model="editForm.role" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="user">Reader</option>
              <option value="admin">Admin</option>
              <option value="super-admin">Super Admin</option>
            </select>
          </label>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" @click="cancelEdit">Cancel</button>
            <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" :disabled="editBusy">{{ editBusy ? 'Saving...' : 'Save Changes' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
