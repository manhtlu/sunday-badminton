# Vue Styling Standards

## Principle

Scoped styles by default. Use Tailwind for utility-first approach when available. Keep styles co-located with components.

## Scoped CSS (default)

```vue
<style scoped>
.user-card {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.user-card__name {
  font-weight: 600;
  font-size: 1.125rem;
}

.user-card__email {
  color: var(--text-secondary);
  font-size: 0.875rem;
}
</style>
```

## With Tailwind CSS

```vue
<template>
  <div class="p-4 rounded-lg border border-gray-200">
    <h3 class="font-semibold text-lg">{{ user.name }}</h3>
    <p class="text-gray-500 text-sm">{{ user.email }}</p>

    <!-- Conditional classes -->
    <span
      :class="[
        'px-2 py-1 rounded text-xs font-medium',
        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
      ]"
    >
      {{ user.is_active ? 'Active' : 'Inactive' }}
    </span>
  </div>
</template>

<!-- Extract repeated patterns to component classes -->
<style scoped>
/* Only for patterns too complex for inline Tailwind */
</style>
```

## Dynamic Classes

```vue
<template>
  <!-- Object syntax -->
  <div :class="{ 'is-active': isActive, 'is-disabled': isDisabled }">

  <!-- Array syntax for multiple dynamic -->
  <button :class="[baseClasses, variantClasses, sizeClasses]">

  <!-- Computed classes for complex logic -->
  <div :class="cardClasses">
</template>

<script setup lang="ts">
const baseClasses = 'px-4 py-2 rounded font-medium'

const variantClasses = computed(() => {
  const map = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-200 text-gray-800',
    danger: 'bg-red-600 text-white',
  }
  return map[props.variant]
})

const sizeClasses = computed(() => {
  const map = { sm: 'text-sm h-8', md: 'text-base h-10', lg: 'text-lg h-12' }
  return map[props.size]
})
</script>
```

## CSS Variables for Theming

```css
/* assets/styles/variables.css */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-danger: #ef4444;
  --color-success: #22c55e;
  --border-color: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

[data-theme="dark"] {
  --color-primary: #60a5fa;
  --border-color: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
}
```

## BEM Naming (when using scoped CSS)

```vue
<style scoped>
/* Block */
.user-card { }

/* Element */
.user-card__header { }
.user-card__body { }
.user-card__footer { }

/* Modifier */
.user-card--highlighted { }
.user-card--compact { }
</style>
```

## Rules

- Always use `<style scoped>` — prevent style leaking
- Tailwind: use utility classes in template, avoid `@apply` in most cases
- Non-Tailwind: use BEM naming convention
- Use CSS variables for theming — not hardcoded colors
- Extract complex dynamic classes to computed properties
- Use `:class` binding for conditional styles — not inline `:style`
- Global styles only in `assets/styles/` — imported in `main.ts`
- One `<style>` block per component
- NO `!important` — fix specificity instead
- NO inline `style` attribute unless truly dynamic (calculated values)
- NO deep selectors (`:deep()`) unless styling third-party component internals

---

*Vue Styling Standard v1.0.0 — Vue 3+*
