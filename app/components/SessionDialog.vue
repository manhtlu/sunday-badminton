<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-5xl', background: 'bg-white dark:bg-white' }">
    <div>
      <!-- Green header -->
      <div class="bg-brand px-6 py-4 flex items-center justify-between rounded-t-lg">
        <div>
          <h2 class="text-lg font-bold text-white">
            Chi tiết buổi tập — {{ form.session_date || 'Mới' }}
          </h2>
          <p class="text-sm text-brand-50">Bảng phân bổ tài chính và theo dõi điểm danh</p>
        </div>
        <button class="text-white/70 hover:text-white" @click="isOpen = false">
          <UIcon name="i-heroicons-x-mark" class="text-xl" />
        </button>
      </div>

      <!-- Body: 2 columns -->
      <div class="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
        <!-- Left column -->
        <div class="space-y-5">
          <!-- Date + Court -->
          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="Ngày">
              <UInput v-model="form.session_date" type="date" />
            </UFormGroup>
            <UFormGroup label="Sân">
              <USelect v-model="form.court_id" :options="courtOptions" placeholder="Chọn sân..." />
            </UFormGroup>
          </div>

          <!-- Chi phí -->
          <div class="bg-white rounded-xl p-4 ring-1 ring-gray-200">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-heroicons-banknotes" class="text-brand" />
              <h3 class="text-sm font-bold text-gray-800">Chi phí</h3>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <UFormGroup label="Tiền sân (₫)">
                <UInput v-model.number="form.court_fee" type="number" placeholder="0" />
              </UFormGroup>
              <UFormGroup label="Chi phí khác (₫)">
                <UInput v-model.number="form.misc_fee" type="number" placeholder="0" />
              </UFormGroup>
              <UFormGroup label="Giá 1 ống cầu (₫)">
                <UInput v-model.number="form.shuttlecock_tube_price" type="number" placeholder="0" />
              </UFormGroup>
              <UFormGroup label="Số cầu sử dụng">
                <UInput v-model.number="form.shuttlecock_quantity" type="number" placeholder="0" />
              </UFormGroup>
            </div>
            <UFormGroup label="Ghi chú chi phí" class="mt-3">
              <UInput v-model="form.misc_fee_note" placeholder="Thay quấn cán, nước uống, v.v..." />
            </UFormGroup>
            <p class="text-xs text-gray-500 mt-2">
              Đơn giá cầu: {{ formatCurrency(shuttlecockPricePerUnit) }}/quả · Tiền cầu: {{ formatCurrency(shuttlecockTotal) }} · <strong class="text-gray-900">Tổng: {{ formatCurrency(totalCost) }}</strong>
            </p>
          </div>

          <!-- Chia phí thành viên -->
          <div class="bg-white rounded-xl p-4 ring-1 ring-gray-200">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-calculator" class="text-brand" />
                <h3 class="text-sm font-bold text-gray-800">Chia phí thành viên</h3>
              </div>
              <button class="text-xs font-semibold text-brand hover:underline" @click="resetSplit">
                Đặt lại
              </button>
            </div>
            <!-- Phí nam -->
            <div class="grid grid-cols-2 gap-3">
              <UFormGroup label="Phí nam (₫)">
                <div class="flex items-center gap-2">
                  <UInput
                    v-model.number="form.male_split_fee"
                    type="number"
                    placeholder="0"
                    :disabled="maleEven"
                    class="flex-1"
                  />
                  <label class="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap cursor-pointer">
                    <input v-model="maleEven" type="checkbox" class="rounded text-brand-500 focus:ring-brand-400" />
                    Chia đều
                  </label>
                </div>
              </UFormGroup>
              <UFormGroup label="Phí nữ (₫)">
                <div class="flex items-center gap-2">
                  <UInput
                    v-model.number="form.female_split_fee"
                    type="number"
                    placeholder="0"
                    :disabled="femaleEven"
                    class="flex-1"
                  />
                  <label class="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap cursor-pointer">
                    <input v-model="femaleEven" type="checkbox" class="rounded text-brand-500 focus:ring-brand-400" />
                    Chia đều
                  </label>
                </div>
              </UFormGroup>
            </div>
            <p class="text-xs text-gray-400 mt-2">
              Nam: {{ maleCount + guestMaleCount }} người · Nữ: {{ femaleCount + guestFemaleCount }} người · Tổng chi: {{ formatCurrency(totalCost) }}
            </p>
            <div v-if="splitCalculated" class="text-xs mt-1 p-2 rounded-lg" :class="totalCollected === totalCost ? 'bg-brand-50 text-brand' : 'bg-red-50 text-red-500'">
              Tổng thu: <strong>{{ formatCurrency(totalCollected) }}</strong>
              <span v-if="totalCollected !== totalCost"> (chênh {{ formatCurrency(totalCollected - totalCost) }})</span>
            </div>
          </div>

        </div>

        <!-- Right column: Attendance + Guest notes -->
        <div class="space-y-4">
        <div class="bg-[#eff1f2] rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-clipboard-document-check" class="text-brand" />
              <h3 class="text-sm font-bold text-gray-800">Điểm danh</h3>
            </div>
            <div class="flex items-center gap-2">
              <button class="text-xs text-gray-400 hover:text-red-500" @click="clearAllAttendance">Bỏ chọn tất cả</button>
              <span class="bg-brand-50 text-brand text-xs font-bold px-2 py-0.5 rounded-full">
                {{ presentCount }} có mặt
              </span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto pr-1">
            <template v-for="group in attendanceGroups" :key="group.memberId">
              <!-- Group with guests: wrap in amber background -->
              <div
                v-if="group.hasGuests"
                class="flex gap-1.5 bg-amber-50 ring-1 ring-amber-200 rounded-xl p-1.5"
              >
                <template v-for="item in group.items" :key="item.type + '-' + (item.member?.id ?? item.guestIdx)">
                  <!-- Member in group -->
                  <label
                    v-if="item.type === 'member' && item.member"
                    class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition-colors w-[72px]"
                    :class="attendance[item.member.id]
                      ? 'bg-white ring-1 ring-gray-200'
                      : 'bg-white/50 ring-1 ring-gray-100 opacity-60'"
                  >
                    <div class="relative">
                      <UAvatar :src="item.member.avatar_url" :alt="item.member.name" size="sm" />
                      <input
                        v-model="attendance[item.member.id]"
                        type="checkbox"
                        class="absolute -top-1 -right-1 w-4 h-4 rounded text-brand-500 focus:ring-brand-400"
                      />
                    </div>
                    <p class="text-[11px] font-semibold text-gray-900 text-center leading-tight truncate w-full">{{ item.member.name }}</p>
                    <div v-if="splitCalculated && attendance[item.member.id]" class="w-full" @click.prevent.stop>
                      <input
                        v-model.number="memberFees[item.member.id]"
                        type="number"
                        class="w-full text-[10px] font-bold text-brand text-center bg-transparent border-b border-brand/30 focus:border-brand outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <p v-else class="text-[9px] text-gray-400 uppercase">{{ item.member.gender === 'male' ? 'Nam' : 'Nữ' }}</p>
                  </label>
                  <!-- Guest in group -->
                  <div
                    v-if="item.type === 'guest' && item.guest"
                    class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg bg-amber-100/60 w-[72px]"
                  >
                    <div class="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
                      <UIcon name="i-heroicons-user" class="text-amber-700 text-sm" />
                    </div>
                    <p class="text-[11px] font-semibold text-gray-900 text-center leading-tight truncate w-full">{{ item.guest.name }}</p>
                    <div v-if="splitCalculated" class="w-full">
                      <input
                        v-model.number="guestFees[item.guestIdx!]"
                        type="number"
                        class="w-full text-[10px] font-bold text-brand text-center bg-transparent border-b border-brand/30 focus:border-brand outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <p v-else class="text-[9px] text-amber-600 uppercase">Khách</p>
                  </div>
                </template>
              </div>

              <!-- Solo member (no guests) -->
              <label
                v-else
                class="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg cursor-pointer transition-colors w-[72px]"
                :class="attendance[group.memberId]
                  ? 'bg-white ring-1 ring-gray-200'
                  : 'bg-white/50 ring-1 ring-gray-100 opacity-60'"
              >
                <div class="relative">
                  <UAvatar :src="group.items[0].member!.avatar_url" :alt="group.items[0].member!.name" size="sm" />
                  <input
                    v-model="attendance[group.memberId]"
                    type="checkbox"
                    class="absolute -top-1 -right-1 w-4 h-4 rounded text-brand-500 focus:ring-brand-400"
                  />
                </div>
                <p class="text-[11px] font-semibold text-gray-900 text-center leading-tight truncate w-full">{{ group.items[0].member!.name }}</p>
                <div v-if="splitCalculated && attendance[group.memberId]" class="w-full" @click.prevent.stop>
                  <input
                    v-model.number="memberFees[group.memberId]"
                    type="number"
                    class="w-full text-[10px] font-bold text-brand text-center bg-transparent border-b border-brand/30 focus:border-brand outline-none py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <p v-else class="text-[9px] text-gray-400 uppercase">{{ group.items[0].member!.gender === 'male' ? 'Nam' : 'Nữ' }}</p>
              </label>
            </template>
          </div>
        </div>

          <!-- Khách mời -->
          <div class="bg-[#eff1f2] rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-user-plus" class="text-brand" />
                <h3 class="text-sm font-bold text-gray-800">Khách mời</h3>
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                @click="addGuest"
              >
                <UIcon name="i-heroicons-plus" class="text-sm" />
                Thêm khách
              </button>
            </div>
            <div v-if="guestRows.length" class="space-y-2">
              <div
                v-for="(guest, gIdx) in guestRows"
                :key="gIdx"
                class="bg-white rounded-lg p-2.5 ring-1 ring-gray-200 flex items-center gap-2"
              >
                <UInput
                  v-model="guest.name"
                  placeholder="Tên khách"
                  size="sm"
                  class="flex-1"
                />
                <USelect
                  v-model="guest.gender"
                  :options="[{ label: 'Nam', value: 'male' }, { label: 'Nữ', value: 'female' }]"
                  placeholder="GT"
                  size="sm"
                  class="w-20"
                />
                <USelect
                  v-model="guest.linked_member_id"
                  :options="memberSelectOptions"
                  placeholder="Bạn của..."
                  size="sm"
                  class="flex-1"
                />
                <button
                  type="button"
                  class="text-red-400 hover:text-red-600 flex-shrink-0"
                  @click="removeGuest(gIdx)"
                >
                  <UIcon name="i-heroicons-x-mark" class="text-base" />
                </button>
              </div>
            </div>
            <p v-else class="text-xs text-gray-400 text-center py-2">Chưa có khách mời</p>
          </div>

          <!-- Ghi chú khách -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="text-brand" />
              <h3 class="text-sm font-bold text-gray-800">Ghi chú khách mời</h3>
            </div>
            <UTextarea v-model="form.guest_note" placeholder="Thêm tên khách hoặc hướng dẫn thanh toán đặc biệt..." rows="2" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-lg">
        <button class="text-sm text-gray-500 hover:text-gray-700 font-medium" @click="isOpen = false">
          Hủy
        </button>
        <div class="flex items-center gap-3">
          <UButton variant="outline" color="primary" @click="calculateSplit">
            <UIcon name="i-heroicons-calculator" class="mr-1" />
            Tính toán chia phí
          </UButton>
          <UButton color="primary" :loading="saving" @click="handleSave">
            <UIcon name="i-heroicons-check" class="mr-1" />
            Lưu buổi tập
          </UButton>
        </div>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
interface Member {
  id: number
  name: string
  gender: string
  avatar_url: string
}

interface Court {
  id: number
  name: string
  court_fee?: number
}

const props = defineProps<{
  members: Member[]
  courts: Court[]
  yearMonth: string
}>()

const emit = defineEmits<{
  saved: []
}>()

const isOpen = defineModel<boolean>({ default: false })
const saving = ref(false)
const maleEven = ref(false)
const femaleEven = ref(false)
const splitCalculated = ref(false)

const form = reactive({
  id: null as number | null,
  session_date: '',
  court_id: '' as string | number,
  court_fee: 0,
  misc_fee: 0,
  misc_fee_note: '',
  shuttlecock_tube_price: 0,
  shuttlecock_quantity: 0,
  male_split_fee: 0,
  female_split_fee: 0,
  guest_note: '',
})

const attendance = reactive<Record<number, boolean>>({})
const memberFees = reactive<Record<number, number>>({})
const guestFees = ref<number[]>([])

interface GuestRow {
  name: string
  gender: string
  linked_member_id: string | number
}

const guestRows = ref<GuestRow[]>([])

const memberSelectOptions = computed(() => [
  { label: 'Không', value: '' },
  ...props.members.map((m) => ({ label: m.name, value: m.id })),
])

function getMemberTotalFee(member: Member): number {
  return memberFees[member.id] ?? (member.gender === 'male' ? form.male_split_fee : form.female_split_fee)
}

function addGuest() {
  guestRows.value.push({ name: '', gender: 'male', linked_member_id: '' })
}

function removeGuest(idx: number) {
  guestRows.value.splice(idx, 1)
}

const isEdit = computed(() => !!form.id)

const presentCount = computed(() => Object.values(attendance).filter(Boolean).length)

const courtOptions = computed(() => props.courts.map((c) => ({ label: c.name, value: c.id })))

const shuttlecockPricePerUnit = computed(() => Math.round(form.shuttlecock_tube_price / 12))
const shuttlecockTotal = computed(() => form.shuttlecock_quantity * shuttlecockPricePerUnit.value)

const totalCost = computed(() => shuttlecockTotal.value + form.court_fee + form.misc_fee)

const presentMembers = computed(() => props.members.filter((m) => attendance[m.id]))
const maleCount = computed(() => presentMembers.value.filter((m) => m.gender === 'male').length)
const femaleCount = computed(() => presentMembers.value.filter((m) => m.gender === 'female').length)
const validGuests = computed(() => guestRows.value.filter((g) => g.name.trim()))
const guestMaleCount = computed(() => validGuests.value.filter((g) => g.gender === 'male').length)
const guestFemaleCount = computed(() => validGuests.value.filter((g) => g.gender === 'female').length)
// Build attendance display: each member + their linked guests grouped together
interface AttendanceItem {
  type: 'member' | 'guest'
  member?: Member
  guest?: GuestRow
  guestIdx?: number
  groupId: number | null // member id if has guests, null otherwise
}

const attendanceGroups = computed(() => {
  const groups: { memberId: number; hasGuests: boolean; items: AttendanceItem[] }[] = []

  for (const member of props.members) {
    const linkedGuests = validGuests.value
      .map((g, i) => ({ guest: g, guestIdx: i }))
      .filter((g) => Number(g.guest.linked_member_id) === member.id)

    const items: AttendanceItem[] = [
      { type: 'member', member, groupId: linkedGuests.length ? member.id : null },
    ]
    for (const lg of linkedGuests) {
      items.push({ type: 'guest', guest: lg.guest, guestIdx: lg.guestIdx, groupId: member.id })
    }

    groups.push({ memberId: member.id, hasGuests: linkedGuests.length > 0, items })
  }

  // Unlinked guests (no assigned member)
  const unlinkedGuests = validGuests.value
    .map((g, i) => ({ guest: g, guestIdx: i }))
    .filter((g) => !g.guest.linked_member_id)

  if (unlinkedGuests.length) {
    const items: AttendanceItem[] = unlinkedGuests.map((lg) => ({
      type: 'guest' as const, guest: lg.guest, guestIdx: lg.guestIdx, groupId: -1,
    }))
    groups.push({ memberId: -1, hasGuests: true, items })
  }

  return groups
})

const totalCollected = computed(() => {
  if (!splitCalculated.value) return 0
  const memberTotal = presentMembers.value.reduce((sum, m) => sum + (memberFees[m.id] || 0), 0)
  const guestTotal = guestFees.value.reduce((sum, f) => sum + (f || 0), 0)
  return memberTotal + guestTotal
})


// Auto-fill court fee when court is selected
watch(() => form.court_id, (courtId) => {
  if (!courtId) return
  const court = props.courts.find((c) => c.id === Number(courtId))
  if (court?.court_fee) {
    form.court_fee = court.court_fee
  }
})

// Reset form when dialog opens
watch(isOpen, (val) => {
  if (val && !form.id) {
    resetForm()
  }
})

function resetForm() {
  form.id = null
  form.session_date = `${props.yearMonth}-01`
  form.court_id = props.courts[0]?.id || ''
  form.court_fee = 0
  form.misc_fee = 0
  form.misc_fee_note = ''
  form.shuttlecock_tube_price = 0
  form.shuttlecock_quantity = 0
  form.male_split_fee = 0
  form.female_split_fee = 0
  form.guest_note = ''
  maleEven.value = false
  femaleEven.value = false

  guestRows.value = []
  splitCalculated.value = false
  for (const key of Object.keys(memberFees)) {
    delete memberFees[Number(key)]
  }
  guestFees.value = []

  for (const m of props.members) {
    attendance[m.id] = true
  }
}

function clearAllAttendance() {
  for (const m of props.members) {
    attendance[m.id] = false
  }
}

function resetSplit() {
  form.male_split_fee = 0
  form.female_split_fee = 0
  maleEven.value = false
  femaleEven.value = false
  splitCalculated.value = false
  for (const key of Object.keys(memberFees)) {
    delete memberFees[Number(key)]
  }
  guestFees.value = []
}

function calculateSplit() {
  const total = totalCost.value
  const mc = maleCount.value + guestMaleCount.value
  const fc = femaleCount.value + guestFemaleCount.value
  if (mc + fc === 0) return

  if (maleEven.value && femaleEven.value) {
    // Both even: split equally
    const fee = Math.round(total / (mc + fc) / 1000) * 1000
    form.male_split_fee = fee
    form.female_split_fee = fee
  } else if (maleEven.value && !femaleEven.value) {
    // Male even: calculate from female input
    if (mc > 0) {
      const remaining = total - (form.female_split_fee * fc)
      form.male_split_fee = Math.max(0, Math.round(remaining / mc / 1000) * 1000)
    }
  } else if (femaleEven.value && !maleEven.value) {
    // Female even: calculate from male input
    if (fc > 0) {
      const remaining = total - (form.male_split_fee * mc)
      form.female_split_fee = Math.max(0, Math.round(remaining / fc / 1000) * 1000)
    }
  } else {
    // Both manually entered: keep as-is, just calculate total
  }

  // Clear and re-populate per-person fee overrides
  for (const key of Object.keys(memberFees)) {
    delete memberFees[Number(key)]
  }
  for (const m of presentMembers.value) {
    memberFees[m.id] = m.gender === 'male' ? form.male_split_fee : form.female_split_fee
  }
  guestFees.value = validGuests.value.map((g) =>
    g.gender === 'male' ? form.male_split_fee : form.female_split_fee
  )

  splitCalculated.value = true
}

const client = useSupabaseClient()

async function handleSave() {
  saving.value = true
  try {
    const totalFee = totalCost.value
    const present = presentMembers.value

    const sessionData = {
      court_id: Number(form.court_id),
      session_date: form.session_date,
      status: 'planned',
      shuttlecock_quantity: form.shuttlecock_quantity,
      shuttlecock_price_per_unit: shuttlecockPricePerUnit.value,
      court_fee: form.court_fee,
      misc_fee: form.misc_fee,
      misc_fee_note: form.misc_fee_note || null,
      male_split_fee: form.male_split_fee,
      female_split_fee: form.female_split_fee,
      total_fee: totalFee,
      attendee_count: present.length,
      guest_note: form.guest_note || null,
    }

    let sessionId: number

    if (form.id) {
      await (client.from('sessions') as any).update(sessionData).eq('id', form.id)
      sessionId = form.id
    } else {
      const { data } = await (client.from('sessions') as any).insert(sessionData).select('id').single()
      sessionId = data.id
    }

    const guestsToSave = validGuests.value

    // Calculate guest fees per linked member
    const guestFeeByMember: Record<number, number> = {}
    for (let i = 0; i < guestsToSave.length; i++) {
      const guest = guestsToSave[i]
      const fee = guestFees.value[i] ?? (guest.gender === 'male' ? form.male_split_fee : form.female_split_fee)
      if (guest.linked_member_id) {
        const mid = Number(guest.linked_member_id)
        guestFeeByMember[mid] = (guestFeeByMember[mid] || 0) + fee
      }
    }

    // Save attendances (fee_amount = own fee, guest_fee = linked guests total)
    for (const m of props.members) {
      const isPresent = !!attendance[m.id]
      const fee = isPresent
        ? (memberFees[m.id] ?? (m.gender === 'male' ? form.male_split_fee : form.female_split_fee))
        : 0

      await (client.from('session_attendances') as any).upsert({
        session_id: sessionId,
        member_id: m.id,
        is_present: isPresent,
        fee_amount: fee,
        guest_fee: guestFeeByMember[m.id] || 0,
      }, { onConflict: 'session_id,member_id' })
    }

    // Save guests (with per-guest override fees)
    for (let i = 0; i < guestsToSave.length; i++) {
      const guest = guestsToSave[i]
      const fee = guestFees.value[i] ?? (guest.gender === 'male' ? form.male_split_fee : form.female_split_fee)
      await (client.from('session_guests') as any).insert({
        session_id: sessionId,
        member_id: guest.linked_member_id || null,
        guest_name: guest.name,
        fee_amount: fee,
        note: null,
      })
    }

    isOpen.value = false
    emit('saved')
  } finally {
    saving.value = false
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>
