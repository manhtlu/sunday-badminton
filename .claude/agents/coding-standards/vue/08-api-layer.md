# Vue API Layer Standards

## Principle

API communication is centralized in a service layer. Components and composables never use axios/fetch directly.

## HTTP Client Setup

```ts
// services/api.ts
import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor — attach token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const authStore = useAuthStore()

  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }

  return config
})

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const notify = useNotificationStore()

    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    } else if (error.response?.status === 403) {
      notify.error('You do not have permission to perform this action.')
    } else if (error.response?.status === 500) {
      notify.error('An unexpected error occurred. Please try again.')
    }

    return Promise.reject(error)
  },
)

export default api
```

## Service Pattern

```ts
// services/userService.ts
import api from './api'
import type { User } from '@/types/models'
import type { PaginatedResponse, ApiResponse } from '@/types/api'

export const userService = {
  async list(params: Record<string, any> = {}): Promise<PaginatedResponse<User>> {
    const { data } = await api.get('/users', { params })
    return data
  },

  async getById(id: number): Promise<ApiResponse<User>> {
    const { data } = await api.get(`/users/${id}`)
    return data
  },

  async create(payload: Partial<User>): Promise<ApiResponse<User>> {
    const { data } = await api.post('/users', payload)
    return data
  },

  async update(id: number, payload: Partial<User>): Promise<ApiResponse<User>> {
    const { data } = await api.put(`/users/${id}`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
```

## API Types

```ts
// types/api.ts
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
```

## Usage in Composable

```ts
// composables/useUsers.ts
import { userService } from '@/services/userService'
import { useApiRequest } from './useApiRequest'

export function useUsers() {
  const { data: users, isLoading, error, execute } = useApiRequest()

  const fetchUsers = (filters = {}) =>
    execute(() => userService.list(filters))

  const createUser = (payload: Partial<User>) =>
    execute(() => userService.create(payload))

  return { users, isLoading, error, fetchUsers, createUser }
}
```

## Rules

- One shared axios instance in `services/api.ts`
- One service file per domain entity (`userService`, `orderService`)
- Services are plain objects with async methods — not classes
- Services return typed data — unwrap `response.data` inside service
- Token injection and error handling in interceptors — not in services
- API base URL from environment variable (`VITE_API_URL`)
- Type all request params and response data
- Components call composables → composables call services → services call api
- NO `axios.get()` / `fetch()` in components, composables, or stores
- NO error handling in services — interceptors handle global errors, composables handle local errors

---

*Vue API Layer Standard v1.0.0 — Vue 3+ / Axios*
