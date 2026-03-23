# Vue TypeScript Standards

## Principle

TypeScript is mandatory. Type everything at boundaries (props, emits, API, stores). Leverage inference for internal logic.

## Model Types

```ts
// types/models.ts
export interface User {
  id: number
  name: string
  email: string
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user_id: number
  status: OrderStatus
  total_amount: number
  notes: string | null
  items?: OrderItem[]
  user?: User
  created_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product?: Product
}

// Enums as union types (preferred over TS enum)
export type UserRole = 'admin' | 'manager' | 'user'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'
```

## Form / Payload Types

```ts
// types/api.ts

// Create payload — omit server-generated fields
export type CreateUserPayload = Pick<User, 'name' | 'email'> & {
  password: string
}

// Update payload — all fields optional
export type UpdateUserPayload = Partial<Pick<User, 'name' | 'email'>>

// Filter params
export interface UserListParams {
  search?: string
  role?: UserRole
  is_active?: boolean
  page?: number
  per_page?: number
}
```

## Utility Types

```ts
// types/common.ts

// Nullable shorthand
export type Nullable<T> = T | null

// Make specific keys optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Make specific keys required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

// Form state
export type FormErrors<T> = Partial<Record<keyof T, string>>
```

## Component Typing

```vue
<script setup lang="ts">
import type { User } from '@/types/models'

// Props
const props = defineProps<{
  users: User[]
  selectedId?: number
}>()

// Emits
const emit = defineEmits<{
  select: [user: User]
  delete: [id: number]
}>()

// Refs with type
const inputRef = ref<HTMLInputElement | null>(null)
const modalRef = ref<InstanceType<typeof AppModal> | null>(null)

// Reactive with type
const form = reactive<{ name: string; email: string }>({
  name: '',
  email: '',
})

// Computed infers type from return — no annotation needed
const activeUsers = computed(() => props.users.filter(u => u.is_active))
</script>
```

## Generic Components

```vue
<!-- components/common/AppSelect.vue -->
<script setup lang="ts" generic="T extends { id: number; label: string }">
const props = defineProps<{
  options: T[]
  modelValue?: T
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()
</script>

<template>
  <select @change="emit('update:modelValue', options[($event.target as HTMLSelectElement).selectedIndex])">
    <option v-if="placeholder" disabled selected>{{ placeholder }}</option>
    <option v-for="option in options" :key="option.id" :selected="modelValue?.id === option.id">
      {{ option.label }}
    </option>
  </select>
</template>
```

## Rules

- Use `interface` for object shapes, `type` for unions/intersections/aliases
- Use string union types over TypeScript `enum` (`type Status = 'a' | 'b'`)
- Use `Pick`, `Omit`, `Partial` to derive types — avoid duplication
- Type props, emits, API responses, and store state explicitly
- Let TypeScript infer computed, local refs, and function returns
- Template refs: `ref<HTMLElement | null>(null)` or `ref<InstanceType<typeof Component> | null>(null)`
- Use `generic` attribute for generic components (Vue 3.3+)
- Centralize model types in `types/` — do not define inline in components
- NO `any` — use `unknown` when type is truly unknown, then narrow
- NO type assertions (`as`) unless absolutely necessary — prefer type guards

---

*Vue TypeScript Standard v1.0.0 — Vue 3.3+ / TypeScript 5+*
