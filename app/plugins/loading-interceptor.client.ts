export default defineNuxtPlugin(() => {
  const { start, stop } = useGlobalLoading()
  const supabaseUrl = useRuntimeConfig().public.supabase?.url || ''

  if (!supabaseUrl) return

  const originalFetch = window.fetch
  window.fetch = async function (...args: Parameters<typeof fetch>) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || ''
    const isSupabase = url.startsWith(supabaseUrl)

    if (isSupabase) start()
    try {
      return await originalFetch.apply(this, args)
    } finally {
      if (isSupabase) stop()
    }
  }
})
