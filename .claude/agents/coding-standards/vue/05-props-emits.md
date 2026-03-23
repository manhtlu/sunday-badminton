# Vue Props & Emits

## Principle

Props flow down, events flow up. Use TypeScript for strict typing. Keep component interfaces explicit and minimal.

## Typed Props

```vue
<script setup lang="ts">
import type { User } from '@/types/models'

// Type-only props (preferred)
const props = defineProps<{
  user: User
  isEditable?: boolean
  maxItems?: number
}>()

// With defaults
const props = withDefaults(defineProps<{
  title: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isDisabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  isDisabled: false,
})
</script>
```

## Typed Emits

```vue
<script setup lang="ts">
import type { User } from '@/types/models'

const emit = defineEmits<{
  submit: [data: Record<string, any>]
  update: [user: User]
  delete: [id: number]
  close: []
}>()

// Usage
const handleSubmit = () => {
  emit('submit', formData)
}

const handleDelete = (id: number) => {
  emit('delete', id)
}
</script>
```

## v-model Pattern

```vue
<!-- Parent -->
<SearchInput v-model="searchQuery" />
<UserForm v-model:name="userName" v-model:email="userEmail" />

<!-- SearchInput.vue — single v-model -->
<script setup lang="ts">
const model = defineModel<string>({ default: '' })
</script>

<template>
  <input :value="model" @input="model = ($event.target as HTMLInputElement).value" />
</template>

<!-- UserForm.vue — multiple v-model -->
<script setup lang="ts">
const name = defineModel<string>('name', { required: true })
const email = defineModel<string>('email', { required: true })
</script>

<template>
  <input :value="name" @input="name = ($event.target as HTMLInputElement).value" />
  <input :value="email" @input="email = ($event.target as HTMLInputElement).value" />
</template>
```

## Slots

```vue
<!-- Component with typed slots -->
<script setup lang="ts">
import type { User } from '@/types/models'

defineProps<{
  users: User[]
}>()

defineSlots<{
  default: (props: { user: User }) => any
  empty: () => any
  header: () => any
}>()
</script>

<template>
  <div>
    <slot name="header" />
    <template v-if="users.length">
      <div v-for="user in users" :key="user.id">
        <slot :user="user" />
      </div>
    </template>
    <slot v-else name="empty" />
  </div>
</template>

<!-- Usage -->
<UserList :users="users">
  <template #default="{ user }">
    <UserCard :user="user" />
  </template>
  <template #empty>
    <p>No users found.</p>
  </template>
</UserList>
```

## Rules

- Always use TypeScript generic syntax for props and emits — no runtime declaration
- Use `withDefaults()` for default values
- Use `defineModel()` for v-model (Vue 3.4+)
- Use `defineSlots()` for typed slots
- Props are readonly — never mutate props directly
- Boolean props: use `is`/`has`/`can`/`show` prefix
- Keep props minimal — pass only what the component needs
- Emit specific events with typed payloads — no generic `change` with ambiguous data
- Prefer `v-model` over manual prop + emit for two-way binding
- NO prop drilling more than 2 levels — use provide/inject or stores

---

*Vue Props & Emits Standard v1.0.0 — Vue 3.4+*
