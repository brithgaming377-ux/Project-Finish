<script setup lang="ts">
import { ChevronDown, Menu, X } from '@lucide/vue'

const route = useRoute()
const { user, isAdmin, logout } = useAuth()
const { data: libraryData } = useAdminLibrary()
const { push: toast } = useToast()

const links = computed(() => {
  const base = [
    { label: 'Home', to: '/' },
    { label: 'Books', to: '/products' },
    { label: 'Subjects', to: '/subjects' },
    { label: 'About Us', to: '/about' }
  ]
  if (user.value && !isAdmin.value) base.push({ label: 'Account', to: '/account' })
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
  <header
    class="institution-header sticky top-0 z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-xl"
  >
    <!-- Utility bar -->
    <div class="hidden border-b border-emerald-800 bg-emerald-950 text-white/85 sm:block">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 font-mono text-[10px] uppercase tracking-[0.1em]"
      >
        <span
          >{{ libraryData.settings.libraryName }} &middot; Open digital learning for every
          reader</span
        >
        <div class="flex items-center gap-4">
          <span class="hidden text-emerald-100/70 sm:inline">ETEC CENTER</span>
          <NuxtLink to="/about" class="transition-colors hover:text-white">Help</NuxtLink>
          <span v-if="isAdmin" class="text-amber-300">Admin mode</span>
        </div>
      </div>
    </div>

    <!-- Main nav -->
    <div>
      <div class="mx-auto flex max-w-7xl items-center gap-8 px-6 py-4">
        <NuxtLink
          to="/"
          class="mr-auto flex min-w-0 shrink items-center gap-5 sm:gap-6"
          aria-label="E-LIBRARY home"
        >
          <span class="flex h-12 w-12 shrink-0 items-center justify-center">
            <img
              src="/images/digital-library-logo.png"
              alt="DigitalLibrary"
              class="h-full w-full rounded-full object-contain"
            />
          </span>
          <span class="institution-wordmark min-w-0 pl-1">
            <span
              class="block truncate font-display text-xl font-black leading-none tracking-[-0.06em] text-emerald-900 sm:text-2xl"
              >{{ libraryData.settings.libraryName }}</span
            >
            <span
              class="mt-1 block font-mono text-[8px] uppercase tracking-[0.18em] text-emerald-700"
              >Digital knowledge centre</span
            >
          </span>
        </NuxtLink>

        <nav class="hidden items-center gap-7 md:flex" aria-label="Primary">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="nav-link border-b-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors"
            :class="
              route.path === link.to
                ? 'text-emerald-800 border-amber'
                : 'text-emerald-700 border-transparent hover:text-emerald-900'
            "
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Logged out -->
        <NuxtLink
          v-if="!user"
          to="/login"
          class="premium-interaction hidden items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-premium hover:-translate-y-0.5 hover:bg-emerald-600 sm:inline-flex"
        >
          Log in
        </NuxtLink>

        <!-- Logged in -->
        <div v-else class="hidden sm:block relative">
          <button
            class="premium-interaction flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-white py-1.5 pl-2.5 pr-3.5 text-emerald-900 shadow-sm hover:border-emerald-400"
            type="button"
            @click="menuOpen = !menuOpen"
          >
            <ProfileAvatar
              :name="user.name"
              :avatar="user.avatar"
              class="h-8 w-8 shrink-0 border border-line font-display text-xs font-semibold shadow-sm"
              :class="isAdmin ? 'bg-amber text-ink' : 'bg-emerald-700 text-white'"
            />
            <span class="text-sm font-medium">{{ user.name }}</span>
            <ChevronDown class="h-4 w-4" aria-hidden="true" />
          </button>

          <Transition name="dropdown">
            <div
              v-if="menuOpen"
              class="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-emerald-100 bg-white py-1.5 shadow-premium"
              @click="menuOpen = false"
            >
              <p class="mb-1 border-b border-emerald-100 px-3.5 py-2 text-xs text-emerald-700">
                {{ user.email }} &middot; {{ isAdmin ? 'Admin' : 'Reader' }}
              </p>
              <NuxtLink
                v-if="!isAdmin"
                to="/account"
                class="block px-3.5 py-2 text-sm text-emerald-900 hover:bg-emerald-50"
                >My account</NuxtLink
              >
              <NuxtLink
                v-if="isAdmin"
                to="/admin"
                class="block px-3.5 py-2 text-sm text-emerald-900 hover:bg-emerald-50"
                >Management dashboard</NuxtLink
              >
              <button
                type="button"
                class="w-full px-3.5 py-2 text-left text-sm text-rose hover:bg-emerald-50"
                @click="onLogout"
              >
                Sign out
              </button>
            </div>
          </Transition>
        </div>

        <button
          class="rounded-xl p-2 text-emerald-800 hover:bg-emerald-50 md:hidden"
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
        <div
          v-if="mobileOpen"
          class="mobile-menu flex flex-col gap-3 border-t border-emerald-100 px-6 py-4 md:hidden"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium"
            :class="route.path === link.to ? 'font-semibold text-emerald-800' : 'text-emerald-700'"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
          <NuxtLink
            v-if="!user"
            to="/login"
            class="text-sm font-semibold text-emerald-700"
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
