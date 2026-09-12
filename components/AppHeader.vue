<script setup lang="ts">
import { BookOpen, ChevronDown, Menu, X } from '@lucide/vue'

const route = useRoute()
const { user, isAdmin, logout } = useAuth()
const { push: toast } = useToast()

const links = computed(() => {
  const base = [
    { label: 'Home', to: '/' },
    { label: 'Books', to: '/products' },
    { label: 'Subjects', to: '/subjects' },
    { label: 'About Us', to: '/about' }
  ]
  if (user.value) base.push({ label: 'Account', to: '/account' })
  if (isAdmin.value) base.push({ label: 'Management', to: '/admin' })
  return base
})

const mobileOpen = ref(false)
const menuOpen = ref(false)

function onLogout() {
  logout()
  menuOpen.value = false
  toast('Signed out.')
  navigateTo('/')
}

function onMobileLogout() {
  mobileOpen.value = false
  onLogout()
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-line/80 bg-white/95 backdrop-blur-xl">
    <!-- Utility bar -->
    <div class="hidden border-b border-campus-light bg-campus text-white/80 sm:block">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 font-mono text-[10px] uppercase tracking-[0.1em]"
      >
          <span>E-LIBRARY &middot; Open digital learning for every reader</span>
        <div class="flex items-center gap-4">
          <NuxtLink to="/about" class="hover:text-white">Help</NuxtLink>
          <span v-if="isAdmin" class="text-amber">Admin mode</span>
        </div>
      </div>
    </div>

    <!-- Main nav -->
    <div>
      <div class="mx-auto flex max-w-7xl items-center gap-8 px-6 py-4">
        <NuxtLink to="/" class="mr-auto flex shrink-0 items-center gap-2.5" aria-label="E-LIBRARY home">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-amber shadow-sm">
            <BookOpen class="h-5 w-5" stroke-width="1.8" aria-hidden="true" />
          </span>
          <span>
            <span class="block font-display text-2xl leading-none tracking-tight text-campus">E-LIBRARY</span>
            <span class="mt-1 block font-mono text-[8px] uppercase tracking-[0.18em] text-ink-soft">Digital knowledge centre</span>
          </span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 md:flex" aria-label="Primary">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="nav-link border-b-2 pb-1 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors"
            :class="
              route.path === link.to
                ? 'text-ink border-amber'
                : 'text-ink-soft border-transparent hover:text-ink'
            "
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Logged out -->
        <NuxtLink
          v-if="!user"
          to="/login"
          class="premium-interaction hidden items-center gap-2 rounded-lg bg-crimson px-5 py-2.5 text-sm font-bold text-white shadow-premium hover:-translate-y-0.5 hover:bg-campus sm:inline-flex"
        >
          Log in
        </NuxtLink>

        <!-- Logged in -->
        <div v-else class="hidden sm:block relative">
          <button
            class="premium-interaction flex items-center gap-2.5 rounded-xl border border-line bg-white py-1.5 pl-2.5 pr-3.5 shadow-sm hover:border-ink/40"
            type="button"
            @click="menuOpen = !menuOpen"
          >
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center font-display font-semibold text-xs shrink-0"
              :class="isAdmin ? 'bg-amber text-ink' : 'bg-ink text-white'"
            >
              {{ user.name.charAt(0) }}
            </span>
            <span class="text-sm font-medium">{{ user.name }}</span>
            <ChevronDown class="h-4 w-4" aria-hidden="true" />
          </button>

          <Transition name="dropdown">
            <div
              v-if="menuOpen"
              class="absolute right-0 top-full z-30 mt-2 w-48 rounded-card border border-line bg-white py-1.5 shadow-premium"
              @click="menuOpen = false"
            >
            <p class="px-3.5 py-2 text-xs text-ink-soft border-b border-line mb-1">
              {{ user.email }} &middot; {{ isAdmin ? 'Admin' : 'Reader' }}
            </p>
            <NuxtLink to="/account" class="block px-3.5 py-2 text-sm hover:bg-parchment-dim"
              >My account</NuxtLink
            >
            <NuxtLink
              v-if="isAdmin"
              to="/admin"
              class="block px-3.5 py-2 text-sm hover:bg-parchment-dim"
              >Management dashboard</NuxtLink
            >
            <button
              type="button"
              class="w-full text-left px-3.5 py-2 text-sm text-rose hover:bg-parchment-dim"
              @click="onLogout"
            >
              Sign out
            </button>
            </div>
          </Transition>
        </div>

        <button
          class="md:hidden p-2 text-ink"
          type="button"
          aria-label="Toggle menu"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" class="h-5 w-5" aria-hidden="true" />
          <Menu v-else class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <!-- Mobile menu -->
      <Transition name="mobile-menu">
        <div v-if="mobileOpen" class="mobile-menu md:hidden border-t border-line px-6 py-4 flex flex-col gap-3">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium"
          :class="route.path === link.to ? 'text-ink' : 'text-ink-soft'"
          @click="mobileOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
        <NuxtLink
          v-if="!user"
          to="/login"
          class="text-sm font-semibold text-amber-deep"
          @click="mobileOpen = false"
          >Log in</NuxtLink
        >
        <button
          v-else
          type="button"
          class="text-sm font-semibold text-rose text-left"
          @click="onMobileLogout"
        >
          Sign out
        </button>
        </div>
      </Transition>
    </div>
  </header>
</template>
