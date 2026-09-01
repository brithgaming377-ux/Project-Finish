<script setup lang="ts">
const route = useRoute()
const { logout, user } = useAuth()
const { push: toast } = useToast()
const mobileOpen = ref(false)
const search = ref('')
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  PenLine,
  Users,
  BookMarked,
  BookCheck,
  AlertCircle,
  BarChart3,
  FileText,
  Settings,
  Search,
  Bell,
  LogOut,
  ChevronLeft
} from '@lucide/vue'
const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, group: 'main' },
  { label: 'All Books', to: '/admin/inventory', icon: BookOpen, group: 'books' },
  { label: 'Categories', to: '/admin/categories', icon: FolderOpen, group: 'books' },
  { label: 'Authors', to: '/admin/authors', icon: PenLine, group: 'books' },
  { label: 'Users', to: '/admin/readers', icon: Users, group: 'users' },
  { label: 'Borrowed', to: '/admin/circulation', icon: BookMarked, group: 'circulation' },
  { label: 'Returned', to: '/admin/returned', icon: BookCheck, group: 'circulation' },
  { label: 'Overdue', to: '/admin/overdue', icon: AlertCircle, group: 'circulation' },
  { label: 'Statistics', to: '/admin/statistics', icon: BarChart3, group: 'reports' },
  { label: 'Reports', to: '/admin/reports', icon: FileText, group: 'reports' },
  { label: 'Settings', to: '/admin/settings', icon: Settings, group: 'settings' }
]
function onLogout() { logout(); toast('Signed out.'); navigateTo('/') }
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <NuxtLink to="/admin" class="hidden w-52 shrink-0 items-center gap-2 font-display text-lg font-semibold text-slate-900 lg:flex"><BookOpen class="h-5 w-5 text-amber" /><span>Library</span></NuxtLink>
      <div class="relative max-w-xl flex-1"><Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input v-model="search" type="search" placeholder="Search books, members..." class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div>
      <div class="ml-auto flex items-center gap-3"><button type="button" class="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell class="h-5 w-5" /><span class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" /></button><div class="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{{ user?.name?.slice(0, 1) || 'A' }}</span><div class="leading-tight"><p class="text-sm font-semibold">{{ user?.name || 'Admin' }}</p><p class="text-[11px] text-slate-500">Administrator</p></div></div><button type="button" class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Toggle menu" @click="mobileOpen = !mobileOpen">☰</button></div>
    </header>
    <div class="flex min-h-[calc(100vh-4rem)]">
      <aside class="hidden w-56 shrink-0 border-r border-slate-200 bg-white px-3 py-6 lg:flex lg:flex-col">
        <p class="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">E-Library</p>
        <nav class="space-y-0.5 flex-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
            :class="route.path === item.to ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
          >
            <component :is="item.icon" class="h-4 w-4" />
            {{ item.label }}
          </NuxtLink>
        </nav>
        <div class="border-t border-slate-100 pt-4 space-y-1">
          <NuxtLink to="/" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><ChevronLeft class="h-4 w-4" /> Back to library</NuxtLink>
          <button type="button" class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50" @click="onLogout"><LogOut class="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
      <div v-if="mobileOpen" class="fixed inset-x-0 top-16 z-20 border-b border-slate-200 bg-white p-4 shadow-lg lg:hidden">
        <nav class="grid grid-cols-2 gap-2">
          <NuxtLink v-for="item in navItems" :key="item.label" :to="item.to" class="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="mobileOpen = false">{{ item.icon }} {{ item.label }}</NuxtLink>
        </nav>
      </div>
      <main class="min-w-0 flex-1 p-5 sm:p-8"><slot /></main>
    </div>
  </div>
</template>
