export default defineNuxtRouteMiddleware(async () => {
  // Only enforce on the client — auth state is hydrated from localStorage
  // there, so a server-side check would always see a logged-out user.
  if (!import.meta.client) return

  const { isAdmin, isLoggedIn } = useAuth()
  const adminAccess = useAdminAccess()

  if (!adminAccess.loaded.value) {
    await adminAccess.refresh()
  }

  if (!isLoggedIn.value || !isAdmin.value) {
    return navigateTo('/login?redirect=/admin')
  }
})
