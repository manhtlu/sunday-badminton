# Vue Project Structure

## Directory Structure

```
project/
├── src/
│   ├── assets/                    # Static assets (images, fonts)
│   ├── components/
│   │   ├── common/                # Shared/reusable components
│   │   │   ├── AppButton.vue
│   │   │   ├── AppModal.vue
│   │   │   └── AppTable.vue
│   │   └── [feature]/             # Feature-specific components
│   │       ├── UserCard.vue
│   │       └── UserAvatar.vue
│   ├── composables/               # Reusable composition functions
│   │   ├── useAuth.ts
│   │   ├── usePagination.ts
│   │   └── useApiRequest.ts
│   ├── layouts/                   # Layout components
│   │   ├── DefaultLayout.vue
│   │   └── AuthLayout.vue
│   ├── pages/                     # Route-level page components
│   │   ├── HomePage.vue
│   │   ├── users/
│   │   │   ├── UserListPage.vue
│   │   │   ├── UserDetailPage.vue
│   │   │   └── UserFormPage.vue
│   │   └── auth/
│   │       ├── LoginPage.vue
│   │       └── RegisterPage.vue
│   ├── router/
│   │   ├── index.ts               # Router instance
│   │   └── guards.ts              # Navigation guards
│   ├── services/                  # API service layer
│   │   ├── api.ts                 # Axios/fetch instance
│   │   ├── userService.ts
│   │   └── orderService.ts
│   ├── stores/                    # Pinia stores
│   │   ├── authStore.ts
│   │   └── notificationStore.ts
│   ├── types/                     # TypeScript type definitions
│   │   ├── models.ts              # Domain model interfaces
│   │   ├── api.ts                 # API request/response types
│   │   └── common.ts              # Shared utility types
│   ├── utils/                     # Pure utility functions
│   │   ├── format.ts
│   │   ├── validate.ts
│   │   └── date.ts
│   ├── App.vue
│   └── main.ts
├── public/
├── .env
├── .env.example
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js             # If using Tailwind
└── package.json
```

## Rules

- Pages are route-level components — one per route, suffixed with `Page`
- Components are reusable UI — grouped by `common/` or feature folder
- Composables contain reusable stateful logic — prefixed with `use`
- Services handle API communication — one per domain entity
- Stores are for shared state only — local state stays in components
- Types are centralized in `types/` — not scattered in components
- Utils are pure functions — no Vue reactivity, no side effects
- Layouts wrap pages — selected via route meta
- NO components directly in `src/components/` root — always in a subfolder
- NO business logic in components — delegate to composables or services

---

*Vue Project Structure Standard v1.0.0 — Vue 3+*
