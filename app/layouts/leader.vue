<template>
  <div class="min-h-screen bg-[#f5f6f7]">
    <!-- Top Navbar -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">
          <!-- Logo -->
          <NuxtLink to="/dashboard" class="font-bold text-lg text-brand">
            Sunday Badminton
          </NuxtLink>

          <!-- Nav Links (desktop) -->
          <div class="hidden sm:flex items-center gap-6">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-1.5 text-sm font-medium py-4 border-b-2 transition-colors"
              :class="isActive(item.to)
                ? 'text-brand border-brand'
                : 'text-gray-500 border-transparent hover:text-gray-900'"
            >
              <UIcon :name="item.icon" class="text-base" />
              {{ item.label }}
            </NuxtLink>
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-2">
            <UAvatar
              :alt="leaderName"
              size="sm"
            />
            <UButton
              icon="i-heroicons-arrow-right-on-rectangle"
              variant="ghost"
              color="red"
              size="sm"
              @click="handleLogout"
            />
          </div>
        </div>
      </div>

      <!-- Mobile Nav -->
      <div class="sm:hidden border-t border-gray-100">
        <div class="flex justify-around py-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex flex-col items-center px-3 py-1"
            :class="isActive(item.to) ? 'text-primary-500' : 'text-gray-400'"
          >
            <UIcon :name="item.icon" class="text-lg" />
            <span class="text-xs mt-0.5">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const leaderData = import.meta.client ? localStorage.getItem('leader') : null
const leaderName = leaderData ? JSON.parse(leaderData).name : 'Leader'

const navItems = [
  { label: 'Tổng quan', to: '/dashboard', icon: 'i-heroicons-chart-bar' },
  { label: 'Lịch chơi', to: '/dashboard/schedule', icon: 'i-heroicons-calendar' },
  { label: 'Thành viên', to: '/dashboard/members', icon: 'i-heroicons-users' },
  { label: 'Sân', to: '/dashboard/courts', icon: 'i-heroicons-map-pin' },
]

function isActive(path: string) {
  return route.path === path
}

function handleLogout() {
  localStorage.removeItem('leader')
  navigateTo('/')
}
</script>
