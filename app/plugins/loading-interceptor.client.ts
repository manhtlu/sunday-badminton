export default defineNuxtPlugin(() => {
  const { start, stop } = useGlobalLoading()

  const originalFetch = window.fetch
  window.fetch = async function (...args: Parameters<typeof fetch>) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || ''
    const isApi = url.includes('/api/')

    if (isApi) start()
    try {
      return await originalFetch.apply(this, args)
    } finally {
      if (isApi) stop()
    }
  }
})
