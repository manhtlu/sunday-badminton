<template>
  <div class="min-h-screen bg-[#f5f6f7]">
    <!-- Top Navbar -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          <NuxtLink to="/" class="font-bold text-lg text-brand">
            Sunday Badminton
          </NuxtLink>

          <div></div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Bảng điều khiển Tháng {{ selectedMonth }}/{{ selectedYear }}
          </h1>
          <p class="text-sm text-gray-500">Giám sát hàng tháng và bảng phân bổ tài chính</p>
        </div>

        <div class="flex items-center gap-2">
          <button class="bg-brand text-white rounded-lg p-2 hover:bg-brand-600 transition-colors" @click="prevMonth">
            <UIcon name="i-heroicons-chevron-left" class="text-base" />
          </button>
          <span class="text-sm font-medium text-gray-900 min-w-[140px] text-center px-3 py-1.5 bg-white rounded-md shadow-sm ring-1 ring-gray-200">
            {{ monthLabel }}
          </span>
          <button class="bg-brand text-white rounded-lg p-2 hover:bg-brand-600 transition-colors" @click="nextMonth">
            <UIcon name="i-heroicons-chevron-right" class="text-base" />
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-5 ring-1 ring-gray-200 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="bg-blue-50 rounded-lg p-2.5">
              <UIcon name="i-heroicons-calendar" class="text-xl text-blue-500" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Tổng số buổi</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalSessions }}</p>
            </div>
          </div>
        </div>

        <div class="bg-red-500 rounded-xl p-5 text-white shadow-sm">
          <div class="flex items-center gap-3">
            <div class="bg-white/20 rounded-lg p-2.5">
              <UIcon name="i-heroicons-arrow-trending-down" class="text-xl text-white" />
            </div>
            <div>
              <p class="text-sm text-red-100">Tổng chi</p>
              <p class="text-2xl font-bold">{{ formatCurrency(stats.totalExpense) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-brand rounded-xl p-5 text-white shadow-sm">
          <div class="flex items-center gap-3">
            <div class="bg-white/20 rounded-lg p-2.5">
              <UIcon name="i-heroicons-arrow-trending-up" class="text-xl text-white" />
            </div>
            <div>
              <p class="text-sm text-brand-50">Tổng thu</p>
              <p class="text-2xl font-bold">{{ formatCurrency(stats.totalCollected) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Ledger Table (read-only) -->
      <div class="relative">
        <LedgerTableReadonly
          :members="members || []"
          :sessions="editableSessions"
          :paid-status="paidStatus"
          :highlight-member-id="memberId"
        />
        <div v-if="loadingSessions" class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-10">
          <div class="flex items-center gap-2 text-gray-500">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl" />
            <span class="text-sm">Đang tải...</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Floating buttons -->
    <NuxtLink
      to="/"
      class="fixed bottom-6 left-6 z-50 bg-white shadow-lg ring-1 ring-gray-200 rounded-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors"
    >
      <UIcon name="i-heroicons-users" class="text-brand text-lg" />
      <span class="text-sm font-medium text-gray-700">Thành viên</span>
    </NuxtLink>

    <NuxtLink
      :to="`/my/${memberId}`"
      class="fixed bottom-6 right-6 z-50 bg-brand shadow-lg rounded-full px-4 py-2.5 flex items-center gap-2 hover:bg-brand-600 transition-colors"
    >
      <UAvatar :src="currentMember?.avatar_url" :alt="currentMember?.name" size="2xs" />
      <span class="text-sm font-medium text-white">Trang cá nhân</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { EditableSession } from '~/components/LedgerTable.vue'

const route = useRoute()
const client = useSupabaseClient()
const memberId = Number(route.params.id)

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

// Fetch members
const { data: members } = await useAsyncData('members', async () => {
  const { data } = await client
    .from('members')
    .select('id, name, gender, avatar_url')
    .eq('is_active', true)
    .order('name')
  return (data || []) as { id: number; name: string; gender: string; avatar_url: string }[]
})

const currentMember = computed(() => {
  return (members.value || []).find((m) => m.id === memberId)
})

// Fetch sessions
const { data: sessions, pending: loadingSessions } = await useAsyncData(
  'sessions',
  async () => {
    const startDate = `${yearMonth.value}-01`
    const daysInMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
    const endDate = `${yearMonth.value}-${String(daysInMonth).padStart(2, '0')}`
    const { data } = await client
      .from('sessions')
      .select('*')
      .gte('session_date', startDate)
      .lte('session_date', endDate)
      .order('session_date')
    return (data || []) as any[]
  },
  { watch: [yearMonth] }
)

// Fetch attendances
const { data: attendances } = await useAsyncData(
  'attendances',
  async () => {
    const sessionIds = (sessions.value || []).map((s) => s.id)
    if (!sessionIds.length) return []
    const { data } = await client
      .from('session_attendances')
      .select('*')
      .in('session_id', sessionIds)
    return (data || []) as any[]
  },
  { watch: [sessions] }
)

// Fetch guests
const { data: guests } = await useAsyncData(
  'guests',
  async () => {
    const sessionIds = (sessions.value || []).map((s) => s.id)
    if (!sessionIds.length) return []
    const { data } = await client
      .from('session_guests')
      .select('*')
      .in('session_id', sessionIds)
    return (data || []) as any[]
  },
  { watch: [sessions] }
)

// Fetch monthly payment status
const { data: monthlyStats } = await useAsyncData(
  'monthlyStats',
  async () => {
    const { data } = await client
      .from('member_monthly_stats')
      .select('member_id, is_paid')
      .eq('year_month', yearMonth.value)
    return (data || []) as any[]
  },
  { watch: [yearMonth] }
)

const paidStatus = computed<Record<number, boolean>>(() => {
  const map: Record<number, boolean> = {}
  for (const m of (members.value || [])) {
    const stat = (monthlyStats.value || []).find((s: any) => s.member_id === m.id)
    map[m.id] = stat?.is_paid || false
  }
  return map
})

// Build editable state (read-only, same structure as leader)
const editableSessions = computed<EditableSession[]>(() => {
  const memberList = members.value || []
  const attList = attendances.value || []
  const guestList = guests.value || []

  return (sessions.value || []).map((s) => {
    const memberFees: Record<number, { fee: number | string; absent: boolean }> = {}
    for (const m of memberList) {
      const att = attList.find((a) => a.session_id === s.id && a.member_id === m.id)
      if (att && att.is_present) {
        const total = (att.fee_amount || 0) + (att.guest_fee || 0)
        memberFees[m.id] = { fee: total || '', absent: false }
      } else {
        memberFees[m.id] = { fee: '', absent: true }
      }
    }

    const sessionGuests = guestList.filter((g) => g.session_id === s.id)
    const guestFee = sessionGuests.reduce((sum: number, g: any) => sum + (g.fee_amount || 0), 0)

    // Build guest list per member
    const memberGuests: Record<number, { name: string; fee: number }[]> = {}
    for (const g of sessionGuests) {
      if (g.member_id) {
        if (!memberGuests[g.member_id]) memberGuests[g.member_id] = []
        memberGuests[g.member_id].push({ name: g.guest_name, fee: g.fee_amount || 0 })
      }
    }

    return {
      id: s.id,
      session_date: s.session_date,
      shuttlecock_fee: (s.shuttlecock_quantity || 0) * (s.shuttlecock_price_per_unit || 0),
      court_fee: s.court_fee || 0,
      guest_fee: guestFee,
      note: s.guest_note || '',
      memberFees,
      memberGuests,
    }
  })
})

// Stats
const stats = computed(() => {
  const list = editableSessions.value
  const totalExpense = list.reduce((sum, s) => sum + s.shuttlecock_fee + s.court_fee, 0)

  let totalCollected = 0
  for (const session of list) {
    for (const [, mf] of Object.entries(session.memberFees)) {
      if (!mf.absent) {
        totalCollected += Number(mf.fee) || 0
      }
    }
  }

  return {
    totalSessions: list.length,
    totalExpense,
    totalCollected,
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
