export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const leader = localStorage.getItem('leader')
  if (!leader) {
    return navigateTo('/login')
  }
})
