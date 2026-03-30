<template>
  <div class="min-h-screen bg-[#f5f6f7] pb-32">
    <!-- Top bar -->
    <div class="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
      <NuxtLink to="/" class="text-gray-500 text-sm flex items-center gap-1">
        <UIcon name="i-heroicons-arrow-left" />
      </NuxtLink>
      <h1 class="text-sm font-bold text-gray-900">Trang của tôi</h1>
      <UAvatar :src="member?.avatar_url" :alt="member?.name" size="xs" />
    </div>

    <div class="max-w-lg mx-auto px-4 pt-4">

      <!-- Fee card (green) -->
      <div class="bg-brand rounded-2xl p-5 mb-4 text-white shadow-md">
        <div class="flex items-center gap-4">
          <!-- Col 1: Avatar + Name -->
          <div class="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div class="relative group cursor-pointer" @click="fileInput?.click()">
              <UAvatar :src="member?.avatar_url" :alt="member?.name" size="lg" />
              <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UIcon name="i-heroicons-camera" class="text-white" />
              </div>
            </div>
            <p class="text-xs text-brand-50 font-medium">{{ member?.name }}</p>
          </div>
          <!-- Col 2: Fee -->
          <div class="flex-1">
            <p class="text-[10px] text-brand-50 uppercase tracking-wide mb-1">Phí tháng này</p>
            <p class="text-2xl font-bold">{{ formatCurrency(monthStats.totalFee) }}</p>
          </div>
          <!-- Col 3: Badge -->
          <div class="flex-shrink-0">
            <span
              class="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              :class="monthStats.isPaid
                ? 'bg-brand-400 text-white'
                : 'bg-yellow-400 text-yellow-900'"
            >
              {{ monthStats.isPaid ? 'ĐÃ NỘP' : 'CHƯA NỘP' }}
            </span>
          </div>
        </div>
      </div>

      <!-- QR buttons -->
      <div class="flex gap-2 mb-4">
        <button
          class="flex-1 bg-red-700 rounded-xl p-3 shadow-md flex items-center justify-center gap-2 hover:bg-red-800 transition-colors"
          @click="showQr = true"
        >
          <UIcon name="i-heroicons-qr-code" class="text-lg text-white" />
          <span class="text-sm font-semibold text-white">Xem QR</span>
        </button>
        <a
          href="/qr.jpg"
          download="qr-chuyen-tien.jpg"
          class="flex-1 bg-amber-600 rounded-xl p-3 shadow-md flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-down-tray" class="text-lg text-white" />
          <span class="text-sm font-semibold text-white">Tải QR</span>
        </a>
      </div>

      <!-- QR Dialog -->
      <UModal v-model="showQr" :ui="{ width: 'sm:max-w-xs' }">
        <div class="p-3">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-bold text-gray-900">QR chuyển tiền</h3>
            <button class="text-gray-400 hover:text-gray-600" @click="showQr = false">
              <UIcon name="i-heroicons-x-mark" class="text-lg" />
            </button>
          </div>
          <img src="/qr.jpg" alt="QR chuyển tiền" class="w-full rounded-lg" />
        </div>
      </UModal>

      <!-- Sessions count card -->
      <div class="bg-white rounded-xl p-4 shadow-sm ring-1 ring-gray-100 flex items-center gap-3">
        <div class="bg-blue-50 rounded-full p-2">
          <UIcon name="i-heroicons-calendar" class="text-lg text-blue-500" />
        </div>
        <div>
          <p class="text-[10px] text-gray-400 uppercase tracking-wide">Số buổi tham gia</p>
          <p class="text-xl font-bold text-gray-900">{{ monthStats.sessionsAttended }}<span class="text-sm font-normal text-gray-400">/{{ monthStats.totalSessions }}</span></p>
        </div>
      </div>

      <div class="h-5"></div>

      <!-- Session list -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-bold text-gray-900">Các buổi tập {{ monthLabel }}</h2>
          <span class="text-xs font-semibold text-brand-400 uppercase">{{ monthStats.sessionsAttended }} đã tham gia</span>
        </div>

        <div v-if="sessionDetails?.length" class="space-y-2">
          <div
            v-for="s in sessionDetails"
            :key="s.sessionId"
            class="bg-[#eff1f2] rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <!-- Icon -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              :class="s.absent ? 'bg-gray-300/50' : 'bg-brand-100'"
            >
              <UIcon
                :name="s.absent ? 'i-heroicons-x-mark' : 'i-heroicons-trophy'"
                :class="s.absent ? 'text-gray-400' : 'text-brand-400'"
                class="text-lg"
              />
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900">Sinh hoạt nội bộ: {{ s.date }}</p>
              <p class="text-xs text-gray-400">{{ s.courtName }}</p>
            </div>
            <!-- Fee -->
            <div v-if="s.absent" class="text-xs text-gray-400 italic">Nghỉ</div>
            <div v-else class="text-sm font-bold text-gray-900">{{ formatCurrency(s.fee) }}</div>
          </div>
        </div>
        <div v-else class="bg-[#eff1f2] rounded-xl px-4 py-8 text-center text-gray-400 text-sm">
          Không có buổi tập nào trong tháng này
        </div>
      </div>

      <!-- View all -->
      <NuxtLink :to="`/my/${memberId}/dashboard`" class="block mb-6">
        <div class="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm px-4 py-3.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
          <span class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Xem tất cả hoạt động</span>
        </div>
      </NuxtLink>
    </div>

    <!-- Month picker (float above bottom nav) -->
    <div class="fixed bottom-14 left-0 right-0 z-20 px-4 pb-2">
      <div class="max-w-lg mx-auto flex items-center justify-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg ring-1 ring-gray-200 px-3 py-2">
        <button class="bg-brand text-white rounded-lg p-1.5 hover:bg-brand-600 transition-colors" @click="prevMonth">
          <UIcon name="i-heroicons-chevron-left" class="text-base" />
        </button>
        <span class="text-sm font-medium text-gray-900 min-w-[130px] text-center">
          {{ monthLabel }}
        </span>
        <button class="bg-brand text-white rounded-lg p-1.5 hover:bg-brand-600 transition-colors" @click="nextMonth">
          <UIcon name="i-heroicons-chevron-right" class="text-base" />
        </button>
      </div>
    </div>

    <!-- Bottom Nav -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div class="flex justify-around py-2 max-w-lg mx-auto">
        <NuxtLink :to="`/my/${$route.params.id}/dashboard`" class="flex flex-col items-center text-gray-400 px-3 py-1">
          <UIcon name="i-heroicons-chart-bar" class="text-lg" />
          <span class="text-[10px] mt-0.5">Tổng quan</span>
        </NuxtLink>
        <NuxtLink to="/" class="flex flex-col items-center text-gray-400 px-3 py-1">
          <UIcon name="i-heroicons-users" class="text-lg" />
          <span class="text-[10px] mt-0.5">Thành viên</span>
        </NuxtLink>
        <div class="flex flex-col items-center text-brand-400 px-3 py-1">
          <UIcon name="i-heroicons-user-circle-solid" class="text-lg" />
          <span class="text-[10px] mt-0.5 font-semibold">Cá nhân</span>
        </div>
      </div>
    </div>

    <!-- Hidden file input for avatar -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleAvatarChange"
    />
  </div>
</template>

<script setup lang="ts">
const MAX_AVATAR_SIZE = 200 * 1024 // 200KB

const route = useRoute()
const client = useSupabaseClient()
const toast = useToast()
const memberId = Number(route.params.id)
const fileInput = ref<HTMLInputElement | null>(null)
const showQr = ref(false)

async function handleAvatarChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > MAX_AVATAR_SIZE) {
    toast.add({ title: 'Ảnh quá lớn', description: 'Vui lòng chọn ảnh nhỏ hơn 200KB.', color: 'red' })
    return
  }

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  await (client.from('members') as any)
    .update({ avatar_url: base64 })
    .eq('id', memberId)

  if (member.value) {
    member.value.avatar_url = base64
  }

  if (fileInput.value) fileInput.value.value = ''
  toast.add({ title: 'Cập nhật thành công', description: 'Ảnh đại diện đã được thay đổi.', color: 'green' })
}

// Month picker
const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1)

const monthLabel = computed(() => {
  const date = new Date(selectedYear.value, selectedMonth.value - 1)
  return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
})

const yearMonth = computed(() => {
  return `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`
})

function prevMonth() {
  if (selectedMonth.value === 1) { selectedMonth.value = 12; selectedYear.value-- }
  else { selectedMonth.value-- }
}

function nextMonth() {
  if (selectedMonth.value === 12) { selectedMonth.value = 1; selectedYear.value++ }
  else { selectedMonth.value++ }
}

// Fetch member
const { data: member } = await useAsyncData('member', async () => {
  const { data } = await client
    .from('members')
    .select('id, name, avatar_url, gender')
    .eq('id', memberId)
    .single()
  return data as any
})

// Fetch sessions + attendances for selected month
const { data: sessionDetails } = await useAsyncData(
  'mySessionDetails',
  async () => {
    const startDate = `${yearMonth.value}-01`
    const endDate = `${yearMonth.value}-31`

    const { data: sessions } = await client
      .from('sessions')
      .select('id, session_date, court_id')
      .gte('session_date', startDate)
      .lte('session_date', endDate)
      .order('session_date')

    if (!sessions?.length) return []

    const sessionIds = sessions.map((s: any) => s.id)
    const courtIds = [...new Set(sessions.map((s: any) => s.court_id))]

    const [{ data: attendances }, { data: courts }] = await Promise.all([
      client
        .from('session_attendances')
        .select('session_id, fee_amount, guest_fee, is_present')
        .eq('member_id', memberId)
        .in('session_id', sessionIds),
      client
        .from('courts')
        .select('id, name')
        .in('id', courtIds),
    ])

    const courtMap: Record<number, string> = {}
    for (const c of (courts || []) as any[]) {
      courtMap[c.id] = c.name
    }

    return sessions.map((s: any) => {
      const att = (attendances || []).find((a: any) => a.session_id === s.id)
      const date = new Date(s.session_date)
      return {
        sessionId: s.id,
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        courtName: courtMap[s.court_id] || '',
        absent: !att || !att.is_present,
        fee: att ? (att.fee_amount || 0) + (att.guest_fee || 0) : 0,
      }
    })
  },
  { watch: [yearMonth] }
)

// Fetch monthly stats for paid status
const { data: allStats } = await useAsyncData(
  'myAllStats',
  async () => {
    const { data } = await client
      .from('member_monthly_stats')
      .select('year_month, is_paid')
      .eq('member_id', memberId)
    return (data || []) as any[]
  },
)

// Month stats
const monthStats = computed(() => {
  const details = sessionDetails.value || []
  const present = details.filter((s) => !s.absent)
  const totalFee = present.reduce((sum, s) => sum + s.fee, 0)
  const stat = (allStats.value || []).find((s: any) => s.year_month === yearMonth.value)

  return {
    sessionsAttended: present.length,
    totalSessions: details.length,
    totalFee,
    isPaid: stat?.is_paid || false,
  }
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>
