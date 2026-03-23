# Vue Routing Standards

## Principle

Routes are declarative. Use lazy loading for all pages. Guards handle auth and permission checks centrally.

## Router Setup

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { layout: 'auth', guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/auth/RegisterPage.vue'),
      meta: { layout: 'auth', guest: true },
    },

    // Authenticated routes
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/pages/users/UserListPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users/:id',
      name: 'user-detail',
      component: () => import('@/pages/users/UserDetailPage.vue'),
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: '/users/:id/edit',
      name: 'user-edit',
      component: () => import('@/pages/users/UserFormPage.vue'),
      meta: { requiresAuth: true, permission: 'users.edit' },
      props: true,
    },

    // Admin routes
    {
      path: '/admin',
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/pages/admin/DashboardPage.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/pages/admin/SettingsPage.vue'),
        },
      ],
    },

    // 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
})

setupGuards(router)

export default router
```

## Navigation Guards

```ts
// router/guards.ts
import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export function setupGuards(router: Router) {
  router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()

    // Fetch user if token exists but user not loaded
    if (authStore.token && !authStore.user) {
      try {
        await authStore.fetchUser()
      } catch {
        authStore.logout()
        return { name: 'login' }
      }
    }

    // Redirect authenticated users away from guest pages
    if (to.meta.guest && authStore.isAuthenticated) {
      return { name: 'home' }
    }

    // Require authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    // Role check
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      return { name: 'home' }
    }
  })
}
```

## Route Meta Typing

```ts
// types/router.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guest?: boolean
    role?: string
    permission?: string
    layout?: 'default' | 'auth'
  }
}
```

## Rules

- All page components are lazy loaded (`() => import(...)`)
- Route names are kebab-case (`user-detail`, `admin-settings`)
- Use `props: true` to pass route params as component props
- Use route `meta` for auth, roles, permissions, layout selection
- Guards are centralized in `guards.ts` — not scattered in components
- Use `router.push({ name: '...' })` — never hardcode paths
- Redirect after login to `query.redirect` or default home
- 404 catch-all route must be last
- NO auth checks in individual components — guards handle it
- NO business logic in guards — delegate to stores

---

*Vue Routing Standard v1.0.0 — Vue 3+ / Vue Router 4*
