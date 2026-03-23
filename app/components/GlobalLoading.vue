<template>
  <Transition name="fade">
    <div v-if="isLoading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
      <div class="bg-white rounded-xl px-5 py-4 shadow-lg flex items-center gap-3">
        <div class="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <span class="text-sm text-gray-600">Đang tải...</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isLoading } = useGlobalLoading()
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
