# Vue State Management

## Principle

Use Pinia for shared/global state. Use component-local state for everything else. Keep stores minimal.

## When to Use What

| State Type | Where | Example |
|---|---|---|
| UI state (toggles, form input) | Component `ref()` | `showModal`, `formData` |
| Shared between siblings | Parent component or `provide/inject` | Theme, config |
| Page-level data | Composable | `useUsers()`, `useOrders()` |
| App-wide persistent state | Pinia store | Auth, notifications, preferences |

## Standard Pinia Store (Setup syntax)

```ts
// stores/authStore.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import type { User, LoginCredentials } from '@/types/models'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? 'Guest')

  // Actions
  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials)
    token.value = response.token
    user.value = response.user
    localStorage.setItem('token', response.token)
  }

  const logout = async () => {
    await authService.logout()
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push({ name: 'login' })
  }

  const fetchUser = async () => {
    if (!token.value) return
    user.value = await authService.me()
  }

  return {
    user,
    token,
    isAuthenticated,
    userName,
    login,
    logout,
    fetchUser,
  }
})
```

## Notification Store Example

```ts
// stores/notificationStore.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  let nextId = 0

  const add = (type: Notification['type'], message: string, duration = 5000) => {
    const id = nextId++
    notifications.value.push({ id, type, message })

    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }

  const remove = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const success = (message: string) => add('success', message)
  const error = (message: string) => add('error', message, 0)
  const warning = (message: string) => add('warning', message)
  const info = (message: string) => add('info', message)

  return { notifications, add, remove, success, error, warning, info }
})
```

## Usage in Components

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const notify = useNotificationStore()

// Use storeToRefs for reactive destructuring
const { user, isAuthenticated } = storeToRefs(authStore)

// Actions can be destructured directly (not reactive)
const { logout } = authStore

const handleLogout = async () => {
  await logout()
  notify.success('Logged out successfully.')
}
</script>
```

## Rules

- Use Setup syntax (`defineStore('name', () => {})`) — not Options syntax
- Use `storeToRefs()` when destructuring state/getters — preserves reactivity
- Actions can be destructured directly — they are plain functions
- One store per domain concern (auth, notifications, app settings)
- Stores call services for API — never use `fetch`/`axios` directly in stores
- Local component state over stores when data is not shared
- NO store for data that only one page uses — use composable instead
- NO deeply nested store state — keep flat
- NO direct store mutation from components — use store actions

---

*Vue State Management Standard v1.0.0 — Vue 3+ / Pinia*
