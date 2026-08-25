<script setup lang="ts">
const route = useRoute()
const { user, isAdmin, logout } = useAuth()
const { push: toast } = useToast()

const links = computed(() => {
  const base = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'Subjects', to: '/subjects' },
    { label: 'About Us', to: '/about' }
  ]
  if (user.value) base.push({ label: 'Account', to: '/account' })
  if (isAdmin.value) base.push({ label: 'Admin', to: '/admin' })
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
</script>

<template>
  <header class="sticky top-0 z-20 bg-parchment">
    <!-- Utility bar -->
    <div class="hidden sm:block border-b border-line bg-ink text-white/80">
      <div class="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs font-mono py-1.5">
        <span>Digital library catalog &middot; free access for all students</span>
        <div class="flex items-center gap-4">
          <NuxtLink to="/about" class="hover:text-white">Help</NuxtLink>
          <span v-if="isAdmin" class="text-amber">Admin mode</span>
        </div>
      </div>
    </div>

    <!-- Main nav -->
    <div class="border-b border-line">
      <div class="max-w-6xl mx-auto px-6 flex items-center gap-8 py-4">
        <NuxtLink to="/" class="flex items-center gap-2 mr-auto shrink-0">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <path d="M2 5.5C5 4 9 4 13 5.5V21.5C9 20 5 20 2 21.5V5.5Z" fill="#14162B" />
            <path d="M24 5.5C21 4 17 4 13 5.5V21.5C17 20 21 20 24 21.5V5.5Z" fill="#C9A227" />
          </svg>
          <span class="font-display font-semibold text-xl">Marginalia</span>
        </NuxtLink>

        <nav class="hidden md:flex gap-7" aria-label="Primary">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium pb-1 border-b-2"
            :class="route.path === link.to ? 'text-ink border-amber' : 'text-ink-soft border-transparent hover:text-ink'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Logged out -->
        <NuxtLink
          v-if="!user"
          to="/login"
          class="hidden sm:inline-flex items-center gap-2 rounded-card bg-ink text-white font-semibold text-sm px-5 py-2.5 hover:bg-ink-light transition"
        >
          Log in
        </NuxtLink>

        <!-- Logged in -->
        <div v-else class="hidden sm:block relative">
          <button
            class="flex items-center gap-2.5 rounded-card border border-line pl-2.5 pr-3.5 py-1.5 hover:border-ink transition"
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>

          <div
            v-if="menuOpen"
            class="absolute right-0 top-full mt-2 w-48 bg-white border border-line rounded-card shadow-premium py-1.5 z-30"
            @click="menuOpen = false"
          >
            <p class="px-3.5 py-2 text-xs text-ink-soft border-b border-line mb-1">{{ user.email }} &middot; {{ isAdmin ? 'Admin' : 'Reader' }}</p>
            <NuxtLink to="/account" class="block px-3.5 py-2 text-sm hover:bg-parchment-dim">My account</NuxtLink>
            <NuxtLink v-if="isAdmin" to="/admin" class="block px-3.5 py-2 text-sm hover:bg-parchment-dim">Admin dashboard</NuxtLink>
            <button type="button" class="w-full text-left px-3.5 py-2 text-sm text-rose hover:bg-parchment-dim" @click="onLogout">Sign out</button>
          </div>
        </div>

        <button
          class="md:hidden p-2 text-ink"
          type="button"
          aria-label="Toggle menu"
          @click="mobileOpen = !mobileOpen"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileOpen" class="md:hidden border-t border-line px-6 py-4 flex flex-col gap-3">
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
        <NuxtLink v-if="!user" to="/login" class="text-sm font-semibold text-amber-deep" @click="mobileOpen = false">Log in</NuxtLink>
        <button v-else type="button" class="text-sm font-semibold text-rose text-left" @click="onLogout(); mobileOpen = false">Sign out</button>
      </div>
    </div>
  </header>
</template>
