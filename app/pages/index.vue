<template>
  <div class="min-h-screen flex flex-col items-center px-4 py-8">
    <!-- Member Grid -->
    <div class="grid grid-cols-2 gap-4 w-full max-w-md">
      <!-- Leader Access -->
      <UCard
        class="cursor-pointer hover:ring-2 hover:ring-primary-500 transition"
        @click="navigateTo('/login')"
      >
        <div class="flex flex-col items-center py-4">
          <UIcon name="i-heroicons-key" class="text-3xl text-primary-500 mb-2" />
          <span class="font-semibold text-sm">Quản lý</span>
        </div>
      </UCard>

      <!-- Members -->
      <UCard
        v-for="member in members"
        :key="member.id"
        class="cursor-pointer hover:ring-2 hover:ring-primary-500 transition"
        @click="navigateTo(`/my/${member.id}`)"
      >
        <div class="flex flex-col items-center py-4">
          <UAvatar
            :src="member.avatar_url"
            :alt="member.name"
            size="lg"
            class="mb-2"
          />
          <span class="font-semibold text-sm">{{ member.name }}</span>
          <UBadge
            :color="member.gender === 'male' ? 'blue' : 'pink'"
            variant="subtle"
            size="xs"
            class="mt-1"
          >
            {{ member.gender === 'male' ? 'Nam' : 'Nữ' }}
          </UBadge>
        </div>
      </UCard>
    </div>

    <!-- Bottom Nav -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div class="flex justify-around py-3 max-w-md mx-auto">
        <NuxtLink to="/" class="flex flex-col items-center text-primary-500">
          <UIcon name="i-heroicons-users" class="text-xl" />
          <span class="text-xs mt-1">Thành viên</span>
        </NuxtLink>
        <NuxtLink to="/login" class="flex flex-col items-center text-gray-400 hover:text-primary-500">
          <UIcon name="i-heroicons-key" class="text-xl" />
          <span class="text-xs mt-1">Quản lý</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()

const { data: members } = await useAsyncData('members', async () => {
  const { data } = await client
    .from('members')
    .select('id, name, avatar_url, gender')
    .eq('is_active', true)
    .order('name')
  return data
})
</script>
