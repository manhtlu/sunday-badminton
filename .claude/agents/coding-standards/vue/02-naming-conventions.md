# Vue Naming Conventions

## Files

| Type | Convention | Example |
|---|---|---|
| Component | PascalCase | `UserCard.vue`, `AppButton.vue` |
| Page | PascalCase + Page suffix | `UserListPage.vue`, `LoginPage.vue` |
| Layout | PascalCase + Layout suffix | `DefaultLayout.vue` |
| Composable | camelCase, `use` prefix | `useAuth.ts`, `usePagination.ts` |
| Store | camelCase + Store suffix | `authStore.ts`, `notificationStore.ts` |
| Service | camelCase + Service suffix | `userService.ts`, `orderService.ts` |
| Type file | camelCase | `models.ts`, `api.ts` |
| Util file | camelCase | `format.ts`, `date.ts` |

## Components

```vue
<!-- In template: PascalCase -->
<template>
  <UserCard :user="user" />
  <AppButton label="Save" @click="save" />
</template>

<!-- Multi-word names required — avoids HTML element conflicts -->
<!-- GOOD -->
<UserCard />
<AppTable />
<OrderStatusBadge />

<!-- BAD -->
<Card />
<Table />
<Badge />
```

## Props, Emits, Variables

```ts
// Props: camelCase in script, kebab-case in template
defineProps<{
  userName: string       // script: camelCase
  isActive: boolean
  itemCount: number
}>()
// template: <UserCard :user-name="name" :is-active="true" />

// Emits: camelCase
defineEmits<{
  updateUser: [user: User]
  deleteItem: [id: number]
  close: []
}>()
// template: @update-user="handler" (auto kebab-case)

// Refs and reactives: camelCase
const userName = ref('')
const formData = reactive({ name: '', email: '' })

// Computed: camelCase, noun or adjective (describes value)
const fullName = computed(() => `${first.value} ${last.value}`)
const isValid = computed(() => name.value.length > 0)
const filteredUsers = computed(() => users.value.filter(...))

// Functions: camelCase, verb prefix
const fetchUsers = async () => { ... }
const handleSubmit = () => { ... }
const toggleModal = () => { ... }
```

## Event Handlers

```ts
// In script: handle* or on* prefix
const handleClick = () => { ... }
const handleSubmit = () => { ... }
const onUserSelect = (user: User) => { ... }

// In template: inline for simple, reference for complex
<AppButton @click="showModal = true" />           // simple toggle
<UserForm @submit="handleSubmit" />                // complex logic
```

## Constants

```ts
// UPPER_SNAKE_CASE for true constants
const MAX_FILE_SIZE = 5 * 1024 * 1024
const API_TIMEOUT = 30000
const DEFAULT_PAGE_SIZE = 15

// Enum-like objects
const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
} as const
```

## Rules

- All component names must be multi-word (Vue ESLint rule)
- Common/shared components prefixed with `App` (`AppButton`, `AppModal`)
- Boolean props prefixed with `is`, `has`, `can`, `show` (`isActive`, `hasError`, `showModal`)
- Event handlers prefixed with `handle` or `on`
- Composables always prefixed with `use`
- Never abbreviate (`btn`, `usr`, `msg`) — use full words

---

*Vue Naming Conventions Standard v1.0.0 — Vue 3+*
