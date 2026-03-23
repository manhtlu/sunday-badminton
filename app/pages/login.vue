<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h2 class="text-lg font-bold text-center">Đăng nhập quản lý</h2>
        <p class="text-sm text-gray-500 text-center mt-1">Nhập mã truy cập</p>
      </template>

      <form @submit.prevent="handleLogin">
        <UFormGroup label="Mã truy cập">
          <UInput
            v-model="accessCode"
            type="password"
            placeholder="Nhập mã..."
            size="lg"
            :disabled="loading"
          />
        </UFormGroup>

        <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>

        <UButton
          type="submit"
          block
          class="mt-4"
          size="lg"
          :loading="loading"
        >
          Đăng nhập
        </UButton>
      </form>

      <template #footer>
        <NuxtLink to="/" class="text-sm text-gray-500 hover:text-primary-500 flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-left" />
          Quay lại
        </NuxtLink>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const accessCode = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  const { data } = await client
    .from('members')
    .select('id, name, role')
    .eq('role', 'leader')
    .eq('access_code', accessCode.value)
    .single()

  if (data) {
    localStorage.setItem('leader', JSON.stringify(data))
    navigateTo('/dashboard')
  } else {
    error.value = 'Mã truy cập không đúng'
  }

  loading.value = false
}
</script>
