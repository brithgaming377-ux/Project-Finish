export default defineNuxtRouteMiddleware(() => {
  // Only enforce on the client — auth state is hydrated from localStorage
  // there, so a server-side check would always see a logged-out user.
  if (!import.meta.client) return

  const { isAdmin } = useAuth()
  if (!isAdmin.value) {
    return navigateTo('/login?redirect=/admin')
  }
})
