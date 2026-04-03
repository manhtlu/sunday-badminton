<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Bảng điều khiển Tháng {{ selectedMonth }}/{{ selectedYear }}
        </h1>
        <p class="text-sm text-gray-500">Giám sát hàng tháng và bảng phân bổ tài chính</p>
      </div>

      <div class="flex items-center gap-2">
        <UButton icon="i-heroicons-chevron-left" variant="solid" color="primary" size="sm" @click="prevMonth" />
        <span class="text-sm font-medium text-gray-700 min-w-[120px] text-center px-3 py-1.5 bg-gray-100 rounded-md border border-gray-200">
          {{ monthLabel }}
        </span>
        <UButton icon="i-heroicons-chevron-right" variant="solid" color="primary" size="sm" @click="nextMonth" />

        <UButton color="primary" size="sm" @click="showSessionDialog = true">
          <UIcon name="i-heroicons-plus" class="mr-1" />
          Thêm buổi tập
        </UButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <!-- Tổng số buổi -->
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

      <!-- Tổng chi -->
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

      <!-- Tổng thu -->
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

    <!-- Ledger Table -->
    <div class="relative">
      <LedgerTable
        :members="members || []"
        :editable-sessions="editableSessions"
        :saving="saving"
        :paid-status="paidStatus"
        @save="saveChanges"
        @reset="resetEdits"
        @toggle-paid="togglePaid"
        @delete-session="deleteSession"
      />
      <!-- Loading overlay -->
      <div v-if="loadingSessions" class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-10">
        <div class="flex items-center gap-2 text-gray-500">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl" />
          <span class="text-sm">Đang tải...</span>
        </div>
      </div>
    </div>

    <!-- Session Dialog -->
    <SessionDialog
      v-model="showSessionDialog"
      :members="membersWithAvatar"
      :courts="courts || []"
      :year-month="yearMonth"
      @saved="onSessionSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { EditableSession } from '~/components/LedgerTable.vue'

definePageMeta({
  layout: 'leader',
  middleware: 'leader',
})

const client = useSupabaseClient()

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

const showSessionDialog = ref(false)
const saving = ref(false)

// Fetch members
const { data: members } = await useAsyncData('members', async () => {
  const { data } = await client
    .from('members')
    .select('id, name, gender, avatar_url')
    .eq('is_active', true)
    .order('name')
  return (data || []) as { id: number; name: string; gender: string; avatar_url: string }[]
})

const membersWithAvatar = computed(() => members.value || [])

// Fetch courts
const { data: courts } = await useAsyncData('courts', async () => {
  const { data } = await client
    .from('courts')
    .select('id, name, court_fee')
    .eq('is_active', true)
    .order('name')
  return (data || []) as { id: number; name: string; court_fee?: number }[]
})

async function onSessionSaved() {
  await refreshSessions()
}

// Fetch sessions
const { data: sessions, refresh: refreshSessions, pending: loadingSessions } = await useAsyncData(
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
const { data: attendances, refresh: refreshAttendances } = await useAsyncData(
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
const { data: monthlyStats, refresh: refreshMonthlyStats } = await useAsyncData(
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

function calcMemberStats(memberId: number) {
  let totalFee = 0
  let sessionsAttended = 0

  for (const session of editableSessions.value) {
    const mf = session.memberFees[memberId]
    if (mf && !mf.absent) {
      totalFee += Number(mf.fee) || 0
      sessionsAttended++
    }
  }

  return { totalFee, sessionsAttended }
}

async function togglePaid(memberId: number) {
  const current = paidStatus.value[memberId]
  const now = new Date().toISOString()
  const { totalFee, sessionsAttended } = calcMemberStats(memberId)

  await (client.from('member_monthly_stats') as any).upsert({
    member_id: memberId,
    year_month: yearMonth.value,
    is_paid: !current,
    paid_at: !current ? now : null,
    total_fee: totalFee,
    extra_fee: 0,
    grand_total: totalFee,
    sessions_attended: sessionsAttended,
    cumulative_total: 0,
  }, { onConflict: 'member_id,year_month' })

  await refreshMonthlyStats()
}

// --- Editable state ---
const editableSessions = ref<EditableSession[]>([])

function buildEditableState() {
  const memberList = members.value || []
  const attList = attendances.value || []
  const guestList = guests.value || []

  editableSessions.value = (sessions.value || []).map((s) => {
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
}

watch([sessions, attendances, guests], () => buildEditableState(), { immediate: true })

function resetEdits() {
  buildEditableState()
}

async function saveChanges() {
  saving.value = true
  try {
    for (const session of editableSessions.value) {
      await (client.from('sessions') as any).update({
        session_date: session.session_date,
        court_fee: session.court_fee,
        total_fee: session.shuttlecock_fee + session.court_fee,
        guest_note: session.note,
      }).eq('id', session.id)

      const memberList = members.value || []
      for (const m of memberList) {
        const mf = session.memberFees[m.id]
        if (!mf) continue
        const feeAmount = Number(mf.fee) || 0

        await (client.from('session_attendances') as any).upsert({
          session_id: session.id,
          member_id: m.id,
          is_present: !mf.absent,
          fee_amount: feeAmount,
          guest_fee: 0,
        }, { onConflict: 'session_id,member_id' })
      }
    }

    await refreshSessions()
    await refreshAttendances()
  } finally {
    saving.value = false
  }
}

async function deleteSession(sessionId: number) {
  if (!confirm('Xóa buổi tập này và toàn bộ dữ liệu liên quan?')) return
  await (client.from('session_guests') as any).delete().eq('session_id', sessionId)
  await (client.from('session_attendances') as any).delete().eq('session_id', sessionId)
  await (client.from('sessions') as any).delete().eq('id', sessionId)
  await refreshSessions()
  await refreshAttendances()
}

// Stats
const stats = computed(() => {
  const list = editableSessions.value
  const totalExpense = list.reduce((sum, s) => sum + s.shuttlecock_fee + s.court_fee, 0)

  // Tổng thu = tổng fee của tất cả members có mặt
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
