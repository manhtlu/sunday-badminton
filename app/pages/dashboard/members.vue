<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-sm text-gray-500 mb-1">
          <NuxtLink to="/dashboard" class="hover:text-brand">Trang chủ</NuxtLink>
          <span class="mx-1">›</span>
          <span>Thành viên</span>
        </p>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý Thành viên</h1>
      </div>
      <UButton color="primary" size="sm" @click="addNewMember">
        <UIcon name="i-heroicons-user-plus" class="mr-1" />
        Thêm mới
      </UButton>
    </div>

    <!-- Members Grid -->
    <div class="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm p-4">
      <div class="grid grid-cols-6 gap-3">
        <div
          v-for="(member, idx) in members"
          :key="member.id ?? member._tempId"
          class="flex flex-col items-center text-center p-3 rounded-xl hover:bg-gray-100/60 transition-colors relative group cursor-pointer ring-1 ring-gray-100"
          :class="member.gender === 'female' ? 'bg-amber-100/60' : 'bg-brand-50/50'"
        >
          <!-- Edit/Delete actions (top-right on hover) -->
          <div v-if="!member._editing" class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton
              icon="i-heroicons-pencil"
              variant="ghost"
              color="primary"
              size="2xs"
              @click="startEdit(member)"
            />
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              color="red"
              size="2xs"
              @click="confirmDelete(member)"
            />
          </div>

          <!-- Avatar -->
          <div class="relative cursor-pointer mb-2" @click="triggerAvatarUpload(member)">
            <UAvatar :src="member.avatar_url" :alt="member.name" size="md" />
            <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <UIcon name="i-heroicons-camera" class="text-white text-sm" />
            </div>
          </div>

          <!-- View mode -->
          <template v-if="!member._editing">
            <p class="text-sm font-semibold text-gray-900 truncate w-full">{{ member.name }}</p>
            <p class="text-xs text-gray-400">{{ member.gender === 'male' ? 'Nam' : 'Nữ' }}{{ member.role === 'leader' ? ' · Leader' : '' }}</p>
          </template>

          <!-- Edit mode -->
          <template v-else>
            <UInput
              v-model="member.name"
              placeholder="Tên..."
              size="xs"
              class="w-full mb-1"
              :ref="(el: any) => { if (member._isNew && el) el.$el?.querySelector('input')?.focus() }"
              @keyup.enter="saveMember(member)"
            />
            <USelect
              v-model="member.gender"
              :options="genderOptions"
              size="xs"
              class="w-full mb-1.5"
            />
            <div class="flex gap-1">
              <UButton icon="i-heroicons-check" variant="soft" color="primary" size="2xs" :disabled="!member.name?.trim()" @click="saveMember(member)" />
              <UButton icon="i-heroicons-x-mark" variant="soft" color="gray" size="2xs" @click="cancelEdit(member)" />
            </div>
          </template>
        </div>
      </div>

      <div v-if="!members.length" class="py-10 text-center text-sm text-gray-400">
        Chưa có thành viên nào
      </div>

      <div class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
        {{ members.length }} thành viên
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleAvatarChange"
    />

    <!-- Delete confirmation -->
    <UModal v-model="showDeleteModal">
      <div class="p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
        <p class="text-sm text-gray-600 mb-4">
          Bạn có chắc chắn muốn xóa thành viên <strong>{{ memberToDelete?.name }}</strong>?
        </p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="gray" @click="showDeleteModal = false">Hủy</UButton>
          <UButton color="red" :loading="deleting" @click="deleteMember">Xóa</UButton>
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

interface MemberRow {
  id: number | null
  name: string
  avatar_url: string | null
  gender: string
  role: string
  is_active: boolean
  _editing?: boolean
  _isNew?: boolean
  _tempId?: number
  _originalName?: string
  _originalGender?: string
}

const client = useSupabaseClient()

const genderOptions = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
]

const members = ref<MemberRow[]>([])
const showDeleteModal = ref(false)
const memberToDelete = ref<MemberRow | null>(null)
const deleting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const avatarTarget = ref<MemberRow | null>(null)
let tempIdCounter = 0

async function fetchMembers() {
  const { data } = await (client.from('members') as any)
    .select('id, name, avatar_url, gender, role, is_active')
    .order('is_active', { ascending: false })
    .order('name')
  members.value = (data || []).map((m: any) => ({ ...m, _editing: false, _isNew: false }))
}

function addNewMember() {
  const newMember: MemberRow = {
    id: null,
    name: '',
    avatar_url: null,
    gender: 'male',
    role: 'member',
    is_active: true,
    _editing: true,
    _isNew: true,
    _tempId: ++tempIdCounter,
  }
  members.value.unshift(newMember)
}

function startEdit(member: MemberRow) {
  member._originalName = member.name
  member._originalGender = member.gender
  member._editing = true
}

function cancelEdit(member: MemberRow) {
  if (member._isNew) {
    const idx = members.value.indexOf(member)
    if (idx >= 0) members.value.splice(idx, 1)
  } else {
    member.name = member._originalName || member.name
    member.gender = member._originalGender || member.gender
    member._editing = false
  }
}

async function saveMember(member: MemberRow) {
  if (!member.name?.trim()) return

  if (member._isNew) {
    const { data } = await (client.from('members') as any)
      .insert({
        name: member.name.trim(),
        gender: member.gender,
        avatar_url: member.avatar_url,
        role: 'member',
        is_active: true,
      })
      .select('id')
      .single()

    if (data) {
      member.id = data.id
      member._isNew = false
      member._editing = false
    }
  } else {
    await (client.from('members') as any)
      .update({
        name: member.name.trim(),
        gender: member.gender,
      })
      .eq('id', member.id)
    member._editing = false
  }
}

async function toggleActive(member: MemberRow) {
  if (member._isNew) return
  const newVal = !member.is_active
  await (client.from('members') as any)
    .update({ is_active: newVal })
    .eq('id', member.id)
  member.is_active = newVal
}

function confirmDelete(member: MemberRow) {
  memberToDelete.value = member
  showDeleteModal.value = true
}

async function deleteMember() {
  if (!memberToDelete.value) return
  deleting.value = true
  try {
    await (client.from('members') as any).delete().eq('id', memberToDelete.value.id)
    const idx = members.value.indexOf(memberToDelete.value)
    if (idx >= 0) members.value.splice(idx, 1)
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

function triggerAvatarUpload(member: MemberRow) {
  avatarTarget.value = member
  fileInput.value?.click()
}

async function handleAvatarChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !avatarTarget.value) return

  const base64 = await fileToBase64(file)
  const member = avatarTarget.value

  member.avatar_url = base64

  if (member.id) {
    await (client.from('members') as any)
      .update({ avatar_url: base64 })
      .eq('id', member.id)
  }

  if (fileInput.value) fileInput.value.value = ''
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

onMounted(fetchMembers)
</script>
