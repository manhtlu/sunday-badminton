const loadingCount = ref(0)

export function useGlobalLoading() {
  const isLoading = computed(() => loadingCount.value > 0)

  function start() {
    loadingCount.value++
  }

  function stop() {
    loadingCount.value = Math.max(0, loadingCount.value - 1)
  }

  return { isLoading, start, stop }
}
