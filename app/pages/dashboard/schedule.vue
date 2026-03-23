<template>
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-sm text-gray-500 mb-1">
          <NuxtLink to="/dashboard" class="hover:text-brand">Trang chủ</NuxtLink>
          <span class="mx-1">›</span>
          <span>Lịch chơi</span>
        </p>
        <h1 class="text-2xl font-bold text-gray-900">Lịch chơi</h1>
      </div>
    </div>

    <!-- Calendar -->
    <div class="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm p-5">
      <ClientOnly>
        <VCalendar
          :attributes="calendarAttributes"
          :first-day-of-week="2"
          locale="vi-VN"
          :masks="{ weekdays: 'WWW' }"
          expanded
          borderless
          transparent
          @update:pages="handlePageUpdate"
        >
          <template #day-content="{ day, attributes }">
            <div class="flex flex-col h-full min-h-[80px] p-1 cursor-pointer" @click="handleDayClick(day)">
              <span
                class="text-xs font-medium w-6 h-6 leading-6 text-center rounded-full self-start"
                :class="day.isToday ? 'bg-brand text-white' : 'text-gray-700'"
              >
                {{ day.day }}
              </span>
              <div v-if="attributes?.length" class="mt-0.5 space-y-0.5 flex-1 overflow-hidden">
                <div
                  v-for="attr in attributes"
                  :key="attr.key"
                  class="text-[10px] leading-tight px-1.5 py-1 rounded cursor-pointer truncate"
                  :class="(attr.customData as any)?.isWeekend
                    ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'bg-brand-50 text-brand-700 hover:bg-brand-100'"
                  @click.stop="editSession((attr.customData as any)?.session)"
                >
                  <p class="font-semibold truncate">{{ (attr.customData as any)?.session?.name }}</p>
                  <p class="opacity-70">
                    {{ formatTime((attr.customData as any)?.session?.start_time) }} -
                    {{ formatTime((attr.customData as any)?.session?.end_time) }}
                  </p>
                </div>
              </div>
            </div>
          </template>
        </VCalendar>
      </ClientOnly>
    </div>

    <!-- Session form modal -->
    <UModal v-model="showForm">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900">
            {{ editingSession ? 'Chỉnh sửa lịch' : 'Thêm lịch mới' }}
          </h3>
          <span class="text-sm text-gray-400">{{ formData.session_date }}</span>
        </div>

        <div class="space-y-4">
          <UFormGroup label="Tên sự kiện">
            <UInput v-model="formData.name" placeholder="Sinh hoạt nội bộ" />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="Bắt đầu">
              <UInput v-model="formData.start_time" type="time" />
            </UFormGroup>
            <UFormGroup label="Kết thúc">
              <UInput v-model="formData.end_time" type="time" />
            </UFormGroup>
          </div>

          <UFormGroup label="Sân">
            <USelect v-model="formData.court_id" :options="courtOptions" placeholder="Chọn sân..." />
          </UFormGroup>
        </div>

        <div class="flex items-center justify-between mt-6">
          <div>
            <UButton
              v-if="editingSession"
              variant="ghost"
              color="red"
              size="sm"
              :loading="deleting"
              @click="deleteSession"
            >
              Xóa lịch
            </UButton>
          </div>
          <div class="flex items-center gap-2">
            <UButton variant="ghost" color="gray" @click="showForm = false">Hủy</UButton>
            <UButton color="primary" :loading="saving" @click="saveSession">Lưu</UButton>
          </div>
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

interface Session {
  id: number
  session_date: string
  name: string
  start_time: string
  end_time: string
  court_id: number | null
}

interface Court {
  id: number
  name: string
}

const client = useSupabaseClient()

const currentPage = ref({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
const sessions = ref<Session[]>([])
const courts = ref<Court[]>([])
const showForm = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingSession = ref<Session | null>(null)

const formData = reactive({
  session_date: '',
  name: 'Sinh hoạt nội bộ',
  start_time: '19:30',
  end_time: '21:30',
  court_id: '' as string | number,
})

const courtOptions = computed(() => [
  { label: 'Không chọn', value: '' },
  ...courts.value.map((c) => ({ label: c.name, value: c.id })),
])

const calendarAttributes = computed(() =>
  sessions.value.map((s) => {
    const date = new Date(s.session_date + 'T00:00:00')
    const dow = date.getDay()
    return {
      key: String(s.id),
      dates: date,
      customData: {
        session: s,
        isWeekend: dow === 0 || dow === 6,
      },
    }
  })
)

function handlePageUpdate(pages: any[]) {
  if (!pages.length) return
  const page = pages[0]
  if (page.month !== currentPage.value.month || page.year !== currentPage.value.year) {
    currentPage.value = { month: page.month, year: page.year }
    fetchSessions()
  }
}

function handleDayClick(day: any) {
  const dateStr = toDateString(day.date)
  const dow = day.date.getDay()
  const isWeekend = dow === 0 || dow === 6

  editingSession.value = null
  formData.session_date = dateStr
  formData.name = 'Sinh hoạt nội bộ'
  formData.court_id = courts.value[0]?.id || ''
  formData.start_time = isWeekend ? '17:30' : '19:30'
  formData.end_time = isWeekend ? '19:30' : '21:30'

  showForm.value = true
}

function editSession(session: Session) {
  editingSession.value = session
  formData.session_date = session.session_date
  formData.name = session.name || 'Sinh hoạt nội bộ'
  formData.start_time = session.start_time?.slice(0, 5) || '19:30'
  formData.end_time = session.end_time?.slice(0, 5) || '21:30'
  formData.court_id = session.court_id || ''
  showForm.value = true
}

async function saveSession() {
  saving.value = true
  try {
    const payload = {
      session_date: formData.session_date,
      name: formData.name || 'Sinh hoạt nội bộ',
      start_time: formData.start_time,
      end_time: formData.end_time,
      court_id: formData.court_id ? Number(formData.court_id) : null,
      status: 'planned',
    }

    if (editingSession.value) {
      await (client.from('sessions') as any)
        .update(payload)
        .eq('id', editingSession.value.id)
    } else {
      await (client.from('sessions') as any).insert(payload)
    }

    showForm.value = false
    await fetchSessions()
  } finally {
    saving.value = false
  }
}

async function deleteSession() {
  if (!editingSession.value) return
  deleting.value = true
  try {
    await (client.from('sessions') as any).delete().eq('id', editingSession.value.id)
    showForm.value = false
    await fetchSessions()
  } finally {
    deleting.value = false
  }
}

function formatTime(time: string | null): string {
  if (!time) return ''
  return time.slice(0, 5)
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function fetchSessions() {
  const { month, year } = currentPage.value
  const daysInMonth = new Date(year, month, 0).getDate()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-${daysInMonth}`

  const { data } = await (client.from('sessions') as any)
    .select('id, session_date, name, start_time, end_time, court_id')
    .gte('session_date', startDate)
    .lte('session_date', endDate)
    .order('start_time')

  sessions.value = (data || []) as Session[]
}

async function fetchCourts() {
  const { data } = await (client.from('courts') as any)
    .select('id, name')
    .order('name')
  courts.value = (data || []) as Court[]
}

onMounted(async () => {
  await Promise.all([fetchSessions(), fetchCourts()])
})
</script>

<style>
/* v-calendar overrides for custom day-content */
.vc-day {
  min-height: 80px !important;
  border-right: 1px solid #e5e7eb !important;
  border-bottom: 1px solid #e5e7eb !important;
}
.vc-day:nth-child(7n) {
  border-right: none !important;
}
.vc-weekdays {
  border-bottom: 1px solid #e5e7eb !important;
}
.vc-day-content {
  display: none !important;
}
.vc-highlight {
  display: none !important;
}
.vc-weeks {
  padding: 0 !important;
}
.vc-header {
  padding: 12px 8px !important;
}
.vc-title {
  font-size: 1.125rem !important;
  font-weight: 700 !important;
  color: #111827 !important;
}
.vc-weekday {
  font-size: 0 !important;
  color: #6b7280 !important;
  padding: 8px 0 !important;
}
.vc-weekday::after {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: none;
}
.vc-weekday:nth-child(1)::after { content: 'Hai'; }
.vc-weekday:nth-child(2)::after { content: 'Ba'; }
.vc-weekday:nth-child(3)::after { content: 'Tư'; }
.vc-weekday:nth-child(4)::after { content: 'Năm'; }
.vc-weekday:nth-child(5)::after { content: 'Sáu'; }
.vc-weekday:nth-child(6)::after { content: 'Bảy'; }
.vc-weekday:nth-child(7)::after { content: 'CN'; }
.vc-arrow {
  color: #6b7280 !important;
}
.vc-arrow:hover {
  background-color: #f3f4f6 !important;
}
</style>
