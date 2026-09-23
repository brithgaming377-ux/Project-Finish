<script setup lang="ts">
import { AlertCircle, BarChart3, Bell, BookCheck, BookMarked, BookOpen, Check, ChevronDown, ChevronLeft, FileText, FolderOpen, LayoutDashboard, LogOut, PenLine, Search, Settings, UserRound, Users, X } from '@lucide/vue'
const route = useRoute()
const { logout, updateProfile, user } = useAuth()
const { data: libraryData } = useAdminLibrary()
const { pending } = useRequests()
const { push: toast } = useToast()
const mobileOpen = ref(false)
const search = ref('')
const notificationsOpen = ref(false)
const accountOpen = ref(false)
const profileOpen = ref(false)
const profileName = ref('')
const profilePassword = ref('')
const profileBusy = ref(false)
const profileAvatar = ref('')
const avatarInput = ref<HTMLInputElement | null>(null)
const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard }, { label: 'All Books', to: '/admin/books', icon: BookOpen },
  { label: 'Categories', to: '/admin/categories', icon: FolderOpen }, { label: 'Authors', to: '/admin/authors', icon: PenLine },
  { label: 'Accounts', to: '/admin/users', icon: Users }, { label: 'Borrowed', to: '/admin/borrowed', icon: BookMarked },
  { label: 'Returned', to: '/admin/returned', icon: BookCheck }, { label: 'Overdue', to: '/admin/overdue', icon: AlertCircle },
  { label: 'Statistics', to: '/admin/statistics', icon: BarChart3 }, { label: 'Reports', to: '/admin/reports', icon: FileText },
  { label: 'Settings', to: '/admin/settings', icon: Settings }
]
function onLogout() { logout(); toast('Signed out.'); navigateTo('/') }
function submitSearch() { const query = search.value.trim(); if (query) navigateTo(`/admin/books?q=${encodeURIComponent(query)}`) }
function toggleNotifications() { notificationsOpen.value = !notificationsOpen.value; accountOpen.value = false }
function toggleAccount() { accountOpen.value = !accountOpen.value; notificationsOpen.value = false }
function openRequest() { notificationsOpen.value = false; navigateTo('/admin') }
function openProfile() {
  if (!libraryData.value.settings.allowProfileEditing) {
    toast('Profile editing is disabled by the library administrator.', 'error')
    accountOpen.value = false
    return
  }
  profileName.value = user.value?.name || ''
  profilePassword.value = ''
  profileAvatar.value = user.value?.avatar || ''
  profileOpen.value = true
  accountOpen.value = false
}
function chooseAvatar() { avatarInput.value?.click() }
async function onAvatarSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  try {
    const result = await $fetch<{ url: string }>('/api/accounts/avatar', { method: 'POST', body: formData })
    profileAvatar.value = result.url
  } catch (err: any) {
    toast(err?.data?.statusMessage || 'Unable to upload profile picture.', 'error')
  } finally {
    input.value = ''
  }
}
async function saveProfile() {
  profileBusy.value = true
  const result = await updateProfile(profileName.value, profilePassword.value, profileAvatar.value)
  profileBusy.value = false
  if (!result.ok) return toast(result.error || 'Unable to update profile.', 'error')
  profileOpen.value = false
  toast('Profile updated.')
}
</script>

<template>
  <div class="admin-shell flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-800">
    <header class="relative z-30 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
      <NuxtLink to="/admin" class="hidden w-52 shrink-0 items-center gap-2 lg:flex" aria-label="E-LIBRARY admin home"><img src="/images/digital-library-logo.png" alt="DigitalLibrary" class="h-12 w-12 rounded-full object-contain" /><span class="font-display text-lg font-semibold text-slate-900">{{ libraryData.settings.libraryName }}</span></NuxtLink>
      <form class="relative max-w-xl flex-1" @submit.prevent="submitSearch"><Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input v-model="search" type="search" placeholder="Search books, members..." class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></form>
      <div class="ml-auto flex items-center gap-3">
        <div class="relative">
          <button type="button" class="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200" :aria-expanded="notificationsOpen" aria-controls="admin-notifications" aria-label="Notifications" @click="toggleNotifications"><Bell class="h-5 w-5" /><span v-if="pending.length" class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" /></button>
          <div v-if="notificationsOpen" id="admin-notifications" class="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3"><p class="text-sm font-semibold text-slate-800">Notifications</p><span class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">{{ pending.length }}</span></div>
            <button v-for="request in pending.slice(0, 4)" :key="request.id" type="button" class="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50" @click="openRequest"><p class="text-sm font-medium text-slate-800">New borrow request</p><p class="mt-0.5 truncate text-xs text-slate-500">{{ request.userName }} is waiting for approval.</p></button>
            <p v-if="!pending.length" class="px-4 py-6 text-center text-sm text-slate-500">You’re all caught up.</p>
          </div>
        </div>
        <div class="relative hidden border-l border-slate-200 pl-3 sm:block">
          <button type="button" class="flex items-center gap-2 rounded-lg pr-1 text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200" :aria-expanded="accountOpen" aria-controls="admin-account-menu" @click="toggleAccount"><ProfileAvatar :name="user?.name || 'Admin'" :avatar="user?.avatar" class="h-11 w-11 border border-line bg-blue-600 text-sm font-bold text-white shadow-sm" /><span class="leading-tight"><span class="block text-sm font-semibold text-slate-800">{{ user?.name || 'Admin' }}</span><span class="block text-[11px] text-slate-500">Administrator</span></span><ChevronDown class="h-4 w-4 text-slate-400" /></button>
          <div v-if="accountOpen" id="admin-account-menu" class="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"><NuxtLink to="/admin" class="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" @click="accountOpen = false">Dashboard</NuxtLink><button type="button" class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50" @click="openProfile"><UserRound class="h-4 w-4" /> Edit profile</button><button type="button" class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50" @click="onLogout"><LogOut class="h-4 w-4" /> Sign out</button></div>
        </div>
        <button type="button" class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Toggle menu" @click="mobileOpen = !mobileOpen">Menu</button>
      </div>
    </header>
    <div class="flex min-h-0 flex-1">
      <aside class="hidden h-full w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-3 py-5 text-slate-800 shadow-sm lg:flex lg:flex-col">
        <nav class="flex-1 space-y-1"><NuxtLink v-for="item in navItems" :key="item.label" :to="item.to" class="relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors" :class="route.path === item.to ? 'text-emerald-700' : 'text-slate-700 hover:text-emerald-700'"><component :is="item.icon" class="h-4 w-4" :class="route.path === item.to ? 'text-emerald-700' : 'text-slate-500'" />{{ item.label }}</NuxtLink></nav>
        <div class="mt-5 space-y-1 border-t border-slate-200 pt-4"><NuxtLink to="/" class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-emerald-700"><ChevronLeft class="h-4 w-4" /> Back to library</NuxtLink><button type="button" class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-red-600" @click="onLogout"><LogOut class="h-4 w-4" /> Sign out</button></div>
      </aside>
      <div v-if="mobileOpen" class="fixed inset-x-0 top-16 z-20 border-b border-slate-200 bg-white p-4 shadow-lg lg:hidden"><nav class="grid grid-cols-2 gap-2"><NuxtLink v-for="item in navItems" :key="item.label" :to="item.to" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="mobileOpen = false"><component :is="item.icon" class="h-4 w-4 text-slate-500" /> {{ item.label }}</NuxtLink></nav></div>
      <main class="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8"><slot /></main>
    </div>
    <div v-if="profileOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm" @click.self="profileOpen = false">
      <section class="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="flex items-start justify-between gap-4">
          <div><p class="admin-eyebrow">Account settings</p><h2 id="profile-title" class="mt-1 font-display text-2xl">Edit profile</h2></div>
          <button type="button" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close profile editor" @click="profileOpen = false"><X class="h-4 w-4" /></button>
        </div>
        <form class="mt-6 space-y-4" @submit.prevent="saveProfile">
          <div class="flex items-center gap-4"><button type="button" class="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber text-lg font-bold text-ink" aria-label="Choose profile picture" @click="chooseAvatar"><img v-if="profileAvatar" :src="profileAvatar" alt="Profile preview" class="h-full w-full object-cover" /><span v-else>{{ profileName.slice(0, 1) || 'A' }}</span><span class="absolute inset-x-0 bottom-0 bg-ink/75 py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">Change</span></button><div><p class="text-sm font-semibold text-slate-700">Profile picture</p><p class="mt-0.5 text-xs text-slate-500">JPG, PNG, or WebP up to 5 MB.</p><input ref="avatarInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="onAvatarSelected" /></div></div>
          <label class="block"><span class="mb-1.5 block text-sm font-semibold text-slate-700">Full name</span><input v-model="profileName" required type="text" class="w-full rounded-lg border border-line bg-parchment-dim px-3 py-2.5 text-sm text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber/20" /></label>
          <label class="block"><span class="mb-1.5 block text-sm font-semibold text-slate-700">Email address</span><input :value="user?.email" disabled type="email" class="w-full rounded-lg border border-line bg-slate-100 px-3 py-2.5 text-sm text-slate-500" /></label>
          <label class="block"><span class="mb-1.5 block text-sm font-semibold text-slate-700">New password <span class="font-normal text-slate-500">(optional)</span></span><input v-model="profilePassword" type="password" minlength="6" placeholder="Leave blank to keep current password" class="w-full rounded-lg border border-line bg-parchment-dim px-3 py-2.5 text-sm text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber/20" /></label>
          <div class="flex justify-end gap-2 pt-2"><button type="button" class="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100" @click="profileOpen = false">Cancel</button><button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-light disabled:cursor-wait disabled:opacity-60" :disabled="profileBusy"><Check class="h-4 w-4" /> {{ profileBusy ? 'Saving...' : 'Save changes' }}</button></div>
        </form>
      </section>
    </div>
    <ToastHost />
  </div>
</template>
