<template>
  <div class="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="font-semibold text-gray-900">Sổ cái tài chính buổi tập</h2>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th class="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-200 w-[80px] sticky left-0 z-10">Ngày</th>
            <th class="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-200">Cầu</th>
            <th class="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-200">Sân</th>
            <th class="px-2 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider bg-gray-200 border border-gray-200 w-[90px]">Tổng</th>
            <th class="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-200">SL</th>
            <th
              v-for="member in members"
              :key="member.id"
              class="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider border border-gray-200"
              :class="member.id === highlightMemberId ? 'bg-amber-100 text-amber-800' : 'bg-brand-50 text-brand'"
            >
              {{ member.name }}
            </th>
            <th class="px-3 py-3 text-center text-xs font-bold text-brand uppercase tracking-wider bg-brand-50 border border-gray-200">Khách</th>
            <th class="px-2 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 border border-gray-200 w-[90px]">Thu</th>
            <th class="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-200">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(session, sIdx) in sessions"
            :key="sIdx"
            class="hover:bg-gray-50/50 transition-colors"
          >
            <!-- Ngày -->
            <td class="px-3 py-2.5 text-center text-gray-900 font-medium border border-gray-200 w-[80px] sticky left-0 z-10 bg-white">
              {{ formatDate(session.session_date) }}
            </td>
            <!-- Cầu -->
            <td class="px-3 py-2.5 text-right text-gray-700 border border-gray-200">
              {{ formatNumber(session.shuttlecock_fee) }}
            </td>
            <!-- Sân -->
            <td class="px-3 py-2.5 text-right text-gray-700 border border-gray-200">
              {{ formatNumber(session.court_fee) }}
            </td>
            <!-- Tổng -->
            <td class="px-2 py-2.5 text-right text-gray-900 font-bold border border-gray-200 bg-gray-50 w-[90px]">
              {{ formatNumber(session.shuttlecock_fee + session.court_fee) }}
            </td>
            <!-- SL -->
            <td class="px-2 py-2.5 text-center text-gray-600 border border-gray-200 bg-gray-50">
              {{ getPresentCount(sIdx) }}
            </td>
            <!-- Member fees -->
            <td
              v-for="member in members"
              :key="member.id"
              class="px-3 py-2.5 text-right border border-gray-200"
              :class="[
                getMemberState(sIdx, member.id) === 'absent' ? 'bg-gray-100 text-gray-300' : 'text-gray-700',
                member.id === highlightMemberId && getMemberState(sIdx, member.id) !== 'absent' ? 'bg-amber-50/80' : '',
              ]"
            >
              {{ getMemberState(sIdx, member.id) === 'absent' ? '' : formatNumber(getMemberFeeValue(sIdx, member.id)) }}
              <!-- Linked guests -->
              <div v-if="session.memberGuests?.[member.id]?.length" class="mt-0.5 space-y-0">
                <div
                  v-for="(g, gi) in session.memberGuests[member.id]"
                  :key="gi"
                  class="flex items-center justify-between text-[9px] text-amber-700"
                >
                  <span class="truncate">{{ g.name }}</span>
                  <span class="font-semibold flex-shrink-0 ml-1">{{ formatNumber(g.fee) }}</span>
                </div>
              </div>
            </td>
            <!-- Khách -->
            <td class="px-3 py-2.5 text-right text-gray-700 border border-gray-200">
              {{ formatNumber(session.guest_fee) }}
            </td>
            <!-- Thu -->
            <td class="px-2 py-2.5 text-right text-blue-700 font-bold border border-gray-200 bg-blue-50/50 w-[90px]">
              {{ formatNumber(getCollectedTotal(sIdx)) }}
            </td>
            <!-- Ghi chú -->
            <td class="px-3 py-2.5 text-left text-gray-500 border border-gray-200 max-w-[200px] truncate">
              {{ session.note }}
            </td>
          </tr>
          <tr v-if="!sessions.length">
            <td :colspan="7 + members.length" class="px-4 py-8 text-center text-gray-400 border border-gray-200">
              Chưa có buổi tập nào trong tháng này
            </td>
          </tr>
        </tbody>
        <!-- Tổng cộng -->
        <tfoot v-if="sessions.length">
          <tr class="font-bold">
            <td class="px-3 py-3 text-center text-gray-900 border border-gray-200 bg-gray-100 sticky left-0 z-10">Tổng tháng</td>
            <td class="px-3 py-3 text-right text-gray-900 border border-gray-200 bg-gray-100">{{ formatNumber(totalRow.shuttlecockFee) }}</td>
            <td class="px-3 py-3 text-right text-gray-900 border border-gray-200 bg-gray-100">{{ formatNumber(totalRow.courtFee) }}</td>
            <td class="px-2 py-3 text-right text-gray-900 border border-gray-200 bg-gray-200">{{ formatNumber(totalRow.total) }}</td>
            <td class="px-3 py-3 text-center text-gray-600 border border-gray-200 bg-gray-100">{{ totalRow.sessionCount }}</td>
            <td
              v-for="member in members"
              :key="member.id"
              class="px-3 py-3 text-right border border-gray-200"
              :class="member.id === highlightMemberId
                ? 'bg-amber-100 text-amber-800 font-bold'
                : paidStatus[member.id]
                  ? 'bg-brand-50 text-brand'
                  : 'bg-gray-100 text-gray-900'"
            >
              {{ formatNumber(getMemberTotal(member.id)) }}
            </td>
            <td class="px-3 py-3 text-right text-gray-900 border border-gray-200 bg-gray-100">{{ formatNumber(totalRow.guestFee) }}</td>
            <td class="px-2 py-3 text-right text-blue-700 border border-gray-200 bg-blue-50">{{ formatNumber(totalRow.collected) }}</td>
            <td class="px-3 py-3 border border-gray-200 bg-gray-100"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EditableSession } from '~/components/LedgerTable.vue'

interface Member {
  id: number
  name: string
  gender: string
}

const props = defineProps<{
  members: Member[]
  sessions: EditableSession[]
  paidStatus: Record<number, boolean>
  highlightMemberId?: number
}>()

function getMemberState(sIdx: number, memberId: number): 'present' | 'absent' {
  return props.sessions[sIdx]?.memberFees[memberId]?.absent ? 'absent' : 'present'
}

function getMemberFeeValue(sIdx: number, memberId: number): number {
  const val = props.sessions[sIdx]?.memberFees[memberId]?.fee
  return Number(val) || 0
}

function getPresentCount(sIdx: number): number {
  const mf = props.sessions[sIdx]?.memberFees || {}
  return Object.values(mf).filter((v) => !v.absent).length
}

function getCollectedTotal(sIdx: number): number {
  const session = props.sessions[sIdx]
  if (!session) return 0
  // memberFees already includes guest_fee per member
  return Object.values(session.memberFees)
    .filter((v) => !v.absent)
    .reduce((sum, v) => sum + (Number(v.fee) || 0), 0)
}

function getMemberTotal(memberId: number): number {
  return props.sessions.reduce((sum, session) => {
    const mf = session.memberFees[memberId]
    if (!mf || mf.absent) return sum
    return sum + (Number(mf.fee) || 0)
  }, 0)
}

const totalRow = computed(() => {
  const list = props.sessions
  return {
    shuttlecockFee: list.reduce((sum, s) => sum + s.shuttlecock_fee, 0),
    courtFee: list.reduce((sum, s) => sum + s.court_fee, 0),
    total: list.reduce((sum, s) => sum + s.shuttlecock_fee + s.court_fee, 0),
    guestFee: list.reduce((sum, s) => sum + (Number(s.guest_fee) || 0), 0),
    collected: list.reduce((sum, _, i) => sum + getCollectedTotal(i), 0),
    sessionCount: list.length,
  }
})

function formatNumber(amount: number) {
  if (!amount) return ''
  return new Intl.NumberFormat('vi-VN').format(amount)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getDate()}/${date.getMonth() + 1}`
}
</script>
