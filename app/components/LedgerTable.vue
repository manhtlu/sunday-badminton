<template>
  <div class="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="font-semibold text-gray-900">Sổ cái tài chính buổi tập</h2>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th class="px-1 py-3 bg-gray-100 border border-gray-200 w-8"></th>
            <th class="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-200 w-[80px]">Ngày</th>
            <th class="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-200">Cầu</th>
            <th class="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-200">Sân</th>
            <th class="px-2 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider bg-gray-200 border border-gray-200 w-[90px]">Tổng</th>
            <th class="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-200">SL</th>
            <th
              v-for="member in members"
              :key="member.id"
              class="px-3 py-3 text-center text-xs font-bold text-brand uppercase tracking-wider bg-brand-50 border border-gray-200"
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
            v-for="(session, sIdx) in editableSessions"
            :key="sIdx"
            class="hover:bg-gray-50/50 transition-colors"
          >
            <!-- Delete -->
            <td class="px-1 py-1 border border-gray-200 w-8 text-center">
              <UButton
                icon="i-heroicons-trash"
                variant="ghost"
                color="red"
                size="2xs"
                @click="emit('delete-session', session.id)"
              />
            </td>
            <!-- Ngày: datepicker -->
            <td class="px-1 py-1 border border-gray-200 w-[80px]">
              <input
                v-model="session.session_date"
                type="date"
                class="w-full px-1 py-1.5 text-sm text-gray-900 text-center border border-gray-300 bg-white focus:ring-1 focus:ring-brand-300 focus:border-brand-300 rounded"
              />
            </td>
            <!-- Cầu -->
            <td class="px-1 py-1 border border-gray-200">
              <input
                :value="formatNumber(session.shuttlecock_fee)"
                type="text"
                class="w-full px-2 py-1.5 text-sm text-gray-900 text-right border border-gray-300 bg-white focus:ring-1 focus:ring-brand-300 focus:border-brand-300 rounded"
                placeholder="0"
                @focus="selectAll"
                @blur="session.shuttlecock_fee = parseFormattedNumber($event)"
              />
            </td>
            <!-- Sân -->
            <td class="px-1 py-1 border border-gray-200">
              <input
                :value="formatNumber(session.court_fee)"
                type="text"
                class="w-full px-2 py-1.5 text-sm text-gray-900 text-right border border-gray-300 bg-white focus:ring-1 focus:ring-brand-300 focus:border-brand-300 rounded"
                placeholder="0"
                @focus="selectAll"
                @blur="session.court_fee = parseFormattedNumber($event)"
              />
            </td>
            <!-- Tổng: auto = Cầu + Sân -->
            <td class="px-2 py-1.5 text-right text-gray-900 font-bold border border-gray-200 bg-gray-50 w-[90px]">
              {{ formatNumber(session.shuttlecock_fee + session.court_fee) }}
            </td>
            <!-- SL: auto count -->
            <td class="px-2 py-1.5 text-center text-gray-600 border border-gray-200 bg-gray-50">
              {{ getPresentCount(sIdx) }}
            </td>
            <!-- Member fee cells -->
            <td
              v-for="member in members"
              :key="member.id"
              class="px-1 py-1 border border-gray-200"
              :class="getMemberState(sIdx, member.id) === 'absent' ? 'bg-gray-100' : ''"
            >
              <div class="flex items-center gap-1">
                <input
                  :value="getMemberState(sIdx, member.id) === 'absent' ? '' : getMemberFee(sIdx, member.id)"
                  type="text"
                  size="5"
                  class="w-[58px] px-1 py-1 text-xs text-right rounded"
                  :class="getMemberState(sIdx, member.id) === 'absent'
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : 'text-gray-900 border border-gray-300 bg-white focus:ring-1 focus:ring-brand-300 focus:border-brand-300'"
                  :disabled="getMemberState(sIdx, member.id) === 'absent'"
                  placeholder="0"
                  @focus="selectAll"
                  @blur="setMemberFee(sIdx, member.id, $event)"
                />
                <button
                  type="button"
                  class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors"
                  :class="getMemberState(sIdx, member.id) === 'absent'
                    ? 'bg-red-100 text-red-500 hover:bg-red-200'
                    : 'bg-brand-100 text-brand-400 hover:bg-brand-200'"
                  :title="getMemberState(sIdx, member.id) === 'absent' ? 'Đánh dấu tham gia' : 'Đánh dấu nghỉ'"
                  @click="toggleAbsent(sIdx, member.id)"
                >
                  <UIcon
                    :name="getMemberState(sIdx, member.id) === 'absent' ? 'i-heroicons-x-mark-16-solid' : 'i-heroicons-check-16-solid'"
                    class="text-xs"
                  />
                </button>
              </div>
              <!-- Linked guests -->
              <div v-if="session.memberGuests?.[member.id]?.length" class="mt-0.5 space-y-0">
                <div
                  v-for="(g, gi) in session.memberGuests[member.id]"
                  :key="gi"
                  class="flex items-center justify-between text-[9px] text-amber-700 px-1"
                >
                  <span class="truncate">{{ g.name }}</span>
                  <span class="font-semibold flex-shrink-0 ml-1">{{ formatNumber(g.fee) }}</span>
                </div>
              </div>
            </td>
            <!-- Khách -->
            <td class="px-1 py-1 border border-gray-200">
              <input
                v-model.number="session.guest_fee"
                type="text"
                class="w-full px-2 py-1.5 text-sm text-gray-900 text-right border border-gray-300 bg-white focus:ring-1 focus:ring-brand-300 focus:border-brand-300 rounded"
                placeholder="0"
                @focus="selectAll"
              />
            </td>
            <!-- Thu: auto sum -->
            <td class="px-2 py-1 text-right text-blue-700 font-bold border border-gray-200 bg-blue-50/50 w-[90px]">
              <div>{{ formatNumber(getCollectedTotal(sIdx)) }}</div>
              <div v-if="isRowDeficit(sIdx)" class="text-[10px] font-normal text-red-400">
                ({{ formatNumber(getCollectedTotal(sIdx) - session.shuttlecock_fee - session.court_fee) }})
              </div>
            </td>
            <!-- Ghi chú -->
            <td class="px-1 py-1 border border-gray-200 min-w-[150px]">
              <input
                v-model="session.note"
                type="text"
                class="w-full px-2 py-1.5 text-sm text-gray-900 border border-gray-300 bg-white focus:ring-1 focus:ring-brand-300 focus:border-brand-300 rounded"
                placeholder="Ghi chú..."
              />
            </td>
          </tr>
          <tr v-if="!editableSessions.length">
            <td :colspan="8 + members.length" class="px-4 py-8 text-center text-gray-400 border border-gray-200">
              Chưa có buổi tập nào trong tháng này
            </td>
          </tr>
        </tbody>
        <!-- Tổng cộng -->
        <tfoot v-if="editableSessions.length">
          <!-- Row tổng -->
          <tr class="font-bold">
            <td class="border border-gray-200 bg-gray-100"></td>
            <td class="px-3 py-3 text-center text-gray-900 border border-gray-200 bg-gray-100">Tổng tháng</td>
            <td class="px-3 py-3 text-right text-gray-900 border border-gray-200 bg-gray-100">{{ formatNumber(totalRow.shuttlecockFee) }}</td>
            <td class="px-3 py-3 text-right text-gray-900 border border-gray-200 bg-gray-100">{{ formatNumber(totalRow.courtFee) }}</td>
            <td class="px-2 py-3 text-right text-gray-900 border border-gray-200 bg-gray-200">{{ formatNumber(totalRow.total) }}</td>
            <td class="px-3 py-3 text-center text-gray-600 border border-gray-200 bg-gray-100">{{ totalRow.sessionCount }}</td>
            <td
              v-for="member in members"
              :key="member.id"
              class="px-3 py-3 text-right border border-gray-200"
              :class="paidStatus[member.id]
                ? 'bg-brand-50 text-brand'
                : 'bg-gray-100 text-gray-900'"
            >
              {{ formatNumber(getMemberTotal(member.id)) }}
            </td>
            <td class="px-3 py-3 text-right text-gray-900 border border-gray-200 bg-gray-100">{{ formatNumber(totalRow.guestFee) }}</td>
            <td class="px-2 py-3 text-right text-blue-700 border border-gray-200 bg-blue-50">{{ formatNumber(totalRow.collected) }}</td>
            <td class="px-3 py-3 border border-gray-200 bg-gray-100"></td>
          </tr>
          <!-- Row trạng thái thanh toán -->
          <tr>
            <td class="px-3 py-2 text-center text-xs font-semibold text-gray-500 border border-gray-200 bg-gray-50" colspan="6">Thanh toán</td>
            <td
              v-for="member in members"
              :key="member.id"
              class="px-1 py-2 text-center border border-gray-200 bg-gray-50"
            >
              <button
                type="button"
                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors"
                :class="paidStatus[member.id]
                  ? 'bg-brand-100 text-brand hover:bg-brand-200'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'"
                @click="emit('togglePaid', member.id)"
              >
                <UIcon
                  :name="paidStatus[member.id] ? 'i-heroicons-check-circle-16-solid' : 'i-heroicons-x-circle-16-solid'"
                  class="text-sm"
                />
                {{ paidStatus[member.id] ? 'Đã nộp' : 'Chưa nộp' }}
              </button>
            </td>
            <td class="px-3 py-2 border border-gray-200 bg-gray-50"></td>
            <td class="px-3 py-2 border border-gray-200 bg-gray-50"></td>
            <td class="px-3 py-2 border border-gray-200 bg-gray-50"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Legend + Footer -->
    <div class="flex items-center justify-end px-6 py-4 border-t border-gray-100">
      <div class="flex items-center gap-3">
        <UButton variant="ghost" color="gray" size="sm" @click="emit('reset')">
          Hủy thay đổi
        </UButton>
        <UButton color="primary" size="sm" :loading="saving" @click="emit('save')">
          Lưu thay đổi
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface EditableSession {
  id: number
  session_date: string
  shuttlecock_fee: number
  court_fee: number
  guest_fee: number
  note: string
  memberFees: Record<number, { fee: number | string; absent: boolean }>
  memberGuests?: Record<number, { name: string; fee: number }[]>
}

interface Member {
  id: number
  name: string
  gender: string
}

const props = defineProps<{
  members: Member[]
  editableSessions: EditableSession[]
  saving: boolean
  paidStatus: Record<number, boolean>
}>()

const emit = defineEmits<{
  save: []
  reset: []
  togglePaid: [memberId: number]
  'delete-session': [sessionId: number]
}>()

// Helpers
function getMemberState(sIdx: number, memberId: number): 'present' | 'absent' {
  return props.editableSessions[sIdx]?.memberFees[memberId]?.absent ? 'absent' : 'present'
}

function getMemberFee(sIdx: number, memberId: number): string {
  const val = props.editableSessions[sIdx]?.memberFees[memberId]?.fee
  if (val === '' || val === 0) return ''
  return formatNumber(Number(val))
}

function setMemberFee(sIdx: number, memberId: number, event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value.replace(/\./g, '').replace(/,/g, '')
  const num = parseInt(raw) || 0
  props.editableSessions[sIdx].memberFees[memberId].fee = num
  props.editableSessions[sIdx].memberFees[memberId].absent = false
}

function toggleAbsent(sIdx: number, memberId: number) {
  const mf = props.editableSessions[sIdx].memberFees[memberId]
  if (!mf) return
  mf.absent = !mf.absent
  if (mf.absent) mf.fee = ''
}

function getPresentCount(sIdx: number): number {
  const mf = props.editableSessions[sIdx]?.memberFees || {}
  return Object.values(mf).filter((v) => !v.absent).length
}

function getCollectedTotal(sIdx: number): number {
  const session = props.editableSessions[sIdx]
  if (!session) return 0
  // memberFees already includes guest_fee per member, so no need to add session.guest_fee
  return Object.values(session.memberFees)
    .filter((v) => !v.absent)
    .reduce((sum, v) => sum + (Number(v.fee) || 0), 0)
}

function formatNumber(amount: number) {
  if (!amount) return ''
  return new Intl.NumberFormat('vi-VN').format(amount)
}

// Totals row
const totalRow = computed(() => {
  const list = props.editableSessions
  return {
    shuttlecockFee: list.reduce((sum, s) => sum + s.shuttlecock_fee, 0),
    courtFee: list.reduce((sum, s) => sum + s.court_fee, 0),
    total: list.reduce((sum, s) => sum + s.shuttlecock_fee + s.court_fee, 0),
    guestFee: list.reduce((sum, s) => sum + (Number(s.guest_fee) || 0), 0),
    collected: list.reduce((sum, s, i) => sum + getCollectedTotal(i), 0),
    sessionCount: list.length,
  }
})

function getMemberTotal(memberId: number): number {
  return props.editableSessions.reduce((sum, session) => {
    const mf = session.memberFees[memberId]
    if (!mf || mf.absent) return sum
    return sum + (Number(mf.fee) || 0)
  }, 0)
}

function isRowDeficit(sIdx: number): boolean {
  const session = props.editableSessions[sIdx]
  if (!session) return false
  const total = session.shuttlecock_fee + session.court_fee
  if (!total) return false
  return getCollectedTotal(sIdx) < total
}

function parseFormattedNumber(event: Event): number {
  const input = event.target as HTMLInputElement
  const raw = input.value.replace(/\./g, '').replace(/,/g, '')
  return parseInt(raw) || 0
}

function selectAll(event: Event) {
  (event.target as HTMLInputElement).select()
}
</script>
