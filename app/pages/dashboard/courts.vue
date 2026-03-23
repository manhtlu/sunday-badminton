<template>
  <div class="max-w-md mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-sm text-gray-500 mb-1">
          <NuxtLink to="/dashboard" class="hover:text-brand">Trang chủ</NuxtLink>
          <span class="mx-1">›</span>
          <span>Sân</span>
        </p>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý Sân</h1>
      </div>
      <UButton color="primary" size="sm" @click="addNewCourt">
        <UIcon name="i-heroicons-plus" class="mr-1" />
        Thêm sân
      </UButton>
    </div>

    <!-- Courts List -->
    <div class="space-y-3">
      <div
        v-for="court in courts"
        :key="court.id ?? court._tempId"
        class="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm"
      >
        <!-- View mode -->
        <template v-if="!court._editing">
          <div class="px-4 py-3 flex items-start gap-3">
            <div class="bg-brand-50 rounded-lg p-2 flex-shrink-0 mt-0.5">
              <UIcon name="i-heroicons-map-pin" class="text-brand text-lg" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-gray-900">{{ court.name }}</p>
                <span
                  v-if="!court.is_active"
                  class="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500"
                >
                  Ngừng hoạt động
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">{{ court.address }}</p>
              <p v-if="court.court_fee" class="text-xs text-brand font-semibold mt-0.5">{{ formatCurrency(court.court_fee) }}/buổi</p>
              <p v-if="court.directions" class="text-xs text-gray-400 mt-1">{{ court.directions }}</p>
            </div>
            <div class="flex items-center gap-0.5 flex-shrink-0">
              <UButton
                icon="i-heroicons-pencil"
                variant="ghost"
                color="primary"
                size="xs"
                @click="startEdit(court)"
              />
              <UButton
                icon="i-heroicons-trash"
                variant="ghost"
                color="red"
                size="xs"
                @click="confirmDelete(court)"
              />
            </div>
          </div>
        </template>

        <!-- Edit mode -->
        <template v-else>
          <div class="p-4 space-y-3">
            <UFormGroup label="Tên sân">
              <UInput
                v-model="court.name"
                placeholder="VD: Sân A"
                size="sm"
                :ref="(el: any) => { if (court._isNew && el) el.$el?.querySelector('input')?.focus() }"
              />
            </UFormGroup>
            <UFormGroup label="Địa chỉ">
              <UInput v-model="court.address" placeholder="VD: 123 Nguyễn Văn Linh, Q.7" size="sm" />
            </UFormGroup>
            <UFormGroup label="Phí sân mặc định (₫)">
              <UInput v-model.number="court.court_fee" type="number" placeholder="0" size="sm" />
            </UFormGroup>
            <UFormGroup label="Hướng dẫn đường đi">
              <UTextarea v-model="court.directions" placeholder="Mô tả đường đi, mốc nhận biết..." rows="2" size="sm" />
            </UFormGroup>
            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="court.is_active"
                  type="checkbox"
                  class="rounded text-brand-500 focus:ring-brand-400"
                />
                <span class="text-xs text-gray-600">Đang hoạt động</span>
              </label>
              <div class="flex items-center gap-2">
                <UButton variant="ghost" color="gray" size="xs" @click="cancelEdit(court)">Hủy</UButton>
                <UButton color="primary" size="xs" :disabled="!court.name?.trim() || !court.address?.trim()" @click="saveCourt(court)">Lưu</UButton>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!courts.length" class="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm px-4 py-10 text-center text-sm text-gray-400">
        Chưa có sân nào
      </div>
    </div>

    <!-- Delete confirmation -->
    <UModal v-model="showDeleteModal">
      <div class="p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
        <p class="text-sm text-gray-600 mb-4">
          Bạn có chắc chắn muốn xóa sân <strong>{{ courtToDelete?.name }}</strong>?
        </p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="gray" @click="showDeleteModal = false">Hủy</UButton>
          <UButton color="red" :loading="deleting" @click="deleteCourt">Xóa</UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'leader',
  middleware: 'leader',
})

interface CourtRow {
  id: number | null
  name: string
  address: string
  directions: string
  court_fee: number
  is_active: boolean
  _editing?: boolean
  _isNew?: boolean
  _tempId?: number
  _original?: { name: string; address: string; directions: string; court_fee: number; is_active: boolean }
}

const client = useSupabaseClient()

const courts = ref<CourtRow[]>([])
const showDeleteModal = ref(false)
const courtToDelete = ref<CourtRow | null>(null)
const deleting = ref(false)
let tempIdCounter = 0

async function fetchCourts() {
  const { data } = await (client.from('courts') as any)
    .select('id, name, address, directions, court_fee, is_active')
    .order('is_active', { ascending: false })
    .order('name')
  courts.value = (data || []).map((c: any) => ({ ...c, directions: c.directions || '', court_fee: c.court_fee || 0, _editing: false, _isNew: false }))
}

function addNewCourt() {
  courts.value.unshift({
    id: null,
    name: '',
    address: '',
    directions: '',
    court_fee: 0,
    is_active: true,
    _editing: true,
    _isNew: true,
    _tempId: ++tempIdCounter,
  })
}

function startEdit(court: CourtRow) {
  court._original = { name: court.name, address: court.address, directions: court.directions, court_fee: court.court_fee, is_active: court.is_active }
  court._editing = true
}

function cancelEdit(court: CourtRow) {
  if (court._isNew) {
    const idx = courts.value.indexOf(court)
    if (idx >= 0) courts.value.splice(idx, 1)
  } else if (court._original) {
    court.name = court._original.name
    court.address = court._original.address
    court.directions = court._original.directions
    court.court_fee = court._original.court_fee
    court.is_active = court._original.is_active
    court._editing = false
  }
}

async function saveCourt(court: CourtRow) {
  if (!court.name?.trim() || !court.address?.trim()) return

  const payload = {
    name: court.name.trim(),
    address: court.address.trim(),
    directions: court.directions?.trim() || null,
    court_fee: court.court_fee || 0,
    is_active: court.is_active,
  }

  if (court._isNew) {
    const { data } = await (client.from('courts') as any)
      .insert(payload)
      .select('id')
      .single()
    if (data) {
      court.id = data.id
      court._isNew = false
      court._editing = false
    }
  } else {
    await (client.from('courts') as any)
      .update(payload)
      .eq('id', court.id)
    court._editing = false
  }
}

function confirmDelete(court: CourtRow) {
  courtToDelete.value = court
  showDeleteModal.value = true
}

async function deleteCourt() {
  if (!courtToDelete.value) return
  deleting.value = true
  try {
    await (client.from('courts') as any).delete().eq('id', courtToDelete.value.id)
    const idx = courts.value.indexOf(courtToDelete.value)
    if (idx >= 0) courts.value.splice(idx, 1)
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
}

onMounted(fetchCourts)
</script>
