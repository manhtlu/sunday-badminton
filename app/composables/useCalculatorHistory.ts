const STORAGE_KEY = 'sunday-badminton-calculator-history'
const MAX_ENTRIES = 10

export function useCalculatorHistory() {
  const entries = ref<string[]>([])

  function loadFromStorage() {
    if (!import.meta.client) {
      return
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      entries.value = raw ? (JSON.parse(raw) as string[]) : []
    }
    catch {
      entries.value = []
    }
  }

  function pushEntry(line: string) {
    if (!import.meta.client || !line.trim()) {
      return
    }
    loadFromStorage()
    const deduped = entries.value.filter((e) => e !== line)
    entries.value = [line, ...deduped].slice(0, MAX_ENTRIES)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
    }
    catch {
      // ignore quota errors
    }
  }

  function clearEntries() {
    entries.value = []
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  onMounted(() => {
    loadFromStorage()
  })

  return {
    entries,
    pushEntry,
    clearEntries,
    loadFromStorage,
  }
}
