# Vue Component Pattern

## Principle

Use `<script setup>` with Composition API. Components are focused, single-responsibility, and follow a consistent internal order.

## Standard Component

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/types/models'
import { useAuth } from '@/composables/useAuth'
import UserCard from '@/components/users/UserCard.vue'
import AppButton from '@/components/common/AppButton.vue'

// 2. Props & Emits
const props = defineProps<{
  userId: number
  isEditable?: boolean
}>()

const emit = defineEmits<{
  update: [user: User]
  close: []
}>()

// 3. Composables
const router = useRouter()
const { currentUser } = useAuth()

// 4. Reactive state
const isLoading = ref(false)
const formData = ref({ name: '', email: '' })

// 5. Computed
const isOwner = computed(() => currentUser.value?.id === props.userId)
const canEdit = computed(() => props.isEditable && isOwner.value)

// 6. Methods
const handleSubmit = async () => {
  isLoading.value = true
  try {
    // ...
    emit('update', updatedUser)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('close')
}

// 7. Lifecycle
onMounted(() => {
  // fetch initial data if needed
})
</script>

<template>
  <div class="user-profile">
    <UserCard :user="currentUser" />

    <form v-if="canEdit" @submit.prevent="handleSubmit">
      <input v-model="formData.name" />
      <input v-model="formData.email" type="email" />

      <div class="actions">
        <AppButton label="Save" type="submit" :loading="isLoading" />
        <AppButton label="Cancel" variant="secondary" @click="handleCancel" />
      </div>
    </form>
  </div>
</template>

<style scoped>
.user-profile {
  /* ... */
}
</style>
```

## Script Setup Order

Always follow this order inside `<script setup>`:

1. **Imports** — external libs, types, composables, components
2. **Props & Emits** — component interface
3. **Composables** — `useRouter()`, `useAuth()`, etc.
4. **Reactive state** — `ref()`, `reactive()`
5. **Computed** — derived state
6. **Methods** — event handlers, actions
7. **Lifecycle hooks** — `onMounted`, `onUnmounted`, etc.
8. **Watchers** — `watch()`, `watchEffect()` (if needed)

## Template Rules

```vue
<template>
  <!-- Directive shorthand: always use shorthand -->
  <div :class="classes" @click="handle" #default="{ item }">

  <!-- v-if / v-else: keep adjacent, no other elements between -->
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="hasError">Error</div>
  <div v-else>Content</div>

  <!-- v-for: always use :key -->
  <UserCard v-for="user in users" :key="user.id" :user="user" />

  <!-- Never use v-if + v-for on same element -->
  <!-- BAD -->
  <div v-for="user in users" v-if="user.isActive" :key="user.id" />
  <!-- GOOD -->
  <div v-for="user in activeUsers" :key="user.id" />

  <!-- Multi-attribute: one per line -->
  <AppButton
    label="Submit"
    variant="primary"
    :loading="isLoading"
    :disabled="!isValid"
    @click="handleSubmit"
  />
</template>
```

## Rules

- Always `<script setup lang="ts">` — no Options API, no `defineComponent()`
- SFC order: `<script>` → `<template>` → `<style>`
- Max component size: ~200 lines — split if larger
- One component per file
- Components do NOT call API directly — use composables or services
- Template expressions must be simple — extract complex logic to computed
- Always use `@submit.prevent` on forms
- Always use `:key` with `v-for`
- Prefer `v-show` for frequent toggles, `v-if` for conditional rendering

---

*Vue Component Pattern Standard v1.0.0 — Vue 3+*
