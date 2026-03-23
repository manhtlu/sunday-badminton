# Vue Composables

## Principle

Composables encapsulate reusable stateful logic. They are the Vue equivalent of hooks — extract shared behavior out of components.

## Standard Composable

```ts
// composables/usePagination.ts
import { ref, computed } from 'vue'

interface UsePaginationOptions {
  initialPage?: number
  perPage?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const currentPage = ref(options.initialPage ?? 1)
  const perPage = ref(options.perPage ?? 15)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / perPage.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  const nextPage = () => {
    if (hasNextPage.value) currentPage.value++
  }

  const prevPage = () => {
    if (hasPrevPage.value) currentPage.value--
  }

  const goToPage = (page: number) => {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  const setTotal = (value: number) => {
    total.value = value
  }

  return {
    currentPage,
    perPage,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    setTotal,
  }
}
```

## API Data Composable

```ts
// composables/useApiRequest.ts
import { ref } from 'vue'

export function useApiRequest<T>() {
  const data = ref<T | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const execute = async (request: () => Promise<T>) => {
    isLoading.value = true
    error.value = null

    try {
      data.value = await request()
    } catch (e: any) {
      error.value = e.response?.data?.message ?? e.message ?? 'Unknown error'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { data, error, isLoading, execute }
}
```

```ts
// composables/useUsers.ts
import { useApiRequest } from './useApiRequest'
import { usePagination } from './usePagination'
import { userService } from '@/services/userService'
import type { User } from '@/types/models'

export function useUsers() {
  const { data: users, error, isLoading, execute } = useApiRequest<User[]>()
  const pagination = usePagination()

  const fetchUsers = async (filters: Record<string, any> = {}) => {
    await execute(async () => {
      const response = await userService.list({
        ...filters,
        page: pagination.currentPage.value,
        per_page: pagination.perPage.value,
      })
      pagination.setTotal(response.meta.total)
      return response.data
    })
  }

  return {
    users,
    error,
    isLoading,
    pagination,
    fetchUsers,
  }
}
```

## Usage in Component

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'

const { users, isLoading, error, pagination, fetchUsers } = useUsers()

onMounted(() => fetchUsers())
</script>
```

## When to Extract a Composable

- Logic is used in 2+ components
- Component is getting large and logic can be isolated
- Stateful logic involves ref + computed + methods as a cohesive unit
- API interaction pattern is reusable

## When NOT to Use a Composable

- Simple one-liner computed or ref — keep in component
- Logic is specific to one component and unlikely to be reused
- Pure utility function with no reactivity — put in `utils/`

## Rules

- Always prefix with `use` (`usePagination`, `useAuth`)
- Always return an object (not array) for named destructuring
- Composables can use other composables (composition)
- Accept options via a typed object parameter with defaults
- Return `readonly()` refs when consumers should not mutate
- Clean up side effects in `onUnmounted` (event listeners, intervals)
- NO direct DOM manipulation — use template refs in components
- NO component-specific logic in shared composables

---

*Vue Composables Standard v1.0.0 — Vue 3+*
