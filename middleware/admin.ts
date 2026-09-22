export default defineNuxtRouteMiddleware(async () => {
  // Only enforce on the client — auth state is hydrated from localStorage
  // there, so a server-side check would always see a logged-out user.
  if (!import.meta.client) return

  const { isAdmin, isLoggedIn } = useAuth()
  const adminAccess = useAdminAccess()

  // Always refresh for the current session. The app may have initially loaded
  // permissions before localStorage restored the signed-in account.
  await adminAccess.refresh()

  if (!isLoggedIn.value || !isAdmin.value) {
    return navigateTo('/admin/login')
  }
})
