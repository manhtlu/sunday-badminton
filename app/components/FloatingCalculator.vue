<template>
  <!-- Dim page behind calculator when open (sits under the floating UI in paint order) -->
  <div
    v-show="isOpen"
    class="fixed inset-0 z-[104] bg-gray-600/45 backdrop-blur-[1px] transition-opacity duration-200"
    aria-hidden="true"
    @click="isOpen = false"
  />

  <slot
    v-if="hasExternalTrigger"
    name="trigger"
    :is-open="isOpen"
    :toggle-open="toggleOpen"
  />

  <div
    v-show="!hasExternalTrigger || isOpen"
    :class="shellClass"
    @click.stop
  >
    <div
      v-show="isOpen"
      class="w-[min(100vw-2rem,18rem)] rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-hidden flex flex-col max-h-[min(70vh,32rem)]"
      @keydown.capture="onPanelKeydown"
    >
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
        <span class="text-xs font-semibold text-gray-600">Máy tính</span>
        <button
          type="button"
          class="p-1 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800"
          aria-label="Đóng"
          @click="isOpen = false"
        >
          <UIcon name="i-heroicons-x-mark" class="text-lg" />
        </button>
      </div>

      <div class="px-3 pt-2 pb-1">
        <input
          ref="exprInputRef"
          v-model="expression"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          spellcheck="false"
          aria-label="Biểu thức"
          placeholder="0"
          class="w-full text-right text-xl sm:text-2xl font-mono font-semibold text-gray-900 bg-gray-50 rounded-lg px-2 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          @keydown="onExprKeydown"
        />
        <p class="text-[10px] text-gray-400 mt-1 text-right">
          Gõ số, + − × ÷, ngoặc (); Enter =, Esc xóa hết
        </p>
      </div>

      <div class="grid grid-cols-4 gap-1.5 px-3 pb-3">
        <button type="button" :class="btnMuted" @click="insertAtCaret('(')">(</button>
        <button type="button" :class="btnMuted" @click="insertAtCaret(')')">)</button>
        <button type="button" :class="btnMuted" @click="clearAll">C</button>
        <button type="button" :class="btnMuted" @click="clearEntry">CE</button>

        <button type="button" :class="btnNum" @click="insertAtCaret('7')">7</button>
        <button type="button" :class="btnNum" @click="insertAtCaret('8')">8</button>
        <button type="button" :class="btnNum" @click="insertAtCaret('9')">9</button>
        <button type="button" :class="btnOp" @click="insertAtCaret('/')">÷</button>

        <button type="button" :class="btnNum" @click="insertAtCaret('4')">4</button>
        <button type="button" :class="btnNum" @click="insertAtCaret('5')">5</button>
        <button type="button" :class="btnNum" @click="insertAtCaret('6')">6</button>
        <button type="button" :class="btnOp" @click="insertAtCaret('*')">×</button>

        <button type="button" :class="btnNum" @click="insertAtCaret('1')">1</button>
        <button type="button" :class="btnNum" @click="insertAtCaret('2')">2</button>
        <button type="button" :class="btnNum" @click="insertAtCaret('3')">3</button>
        <button type="button" :class="btnOp" @click="insertAtCaret('-')">−</button>

        <button type="button" :class="btnNum" class="col-span-2" @click="insertAtCaret('0')">0</button>
        <button type="button" :class="btnNum" @click="insertAtCaret('.')">.</button>
        <button type="button" :class="btnOp" @click="insertAtCaret('+')">+</button>

        <button type="button" :class="btnEquals" class="col-span-3" @click="equals">=</button>
        <button type="button" :class="btnMuted" aria-label="Xóa ký tự" @click="backspace">
          <UIcon name="i-heroicons-backspace" class="text-base mx-auto" />
        </button>
      </div>

      <div class="border-t border-gray-100 px-3 py-2 bg-gray-50 flex-1 min-h-0 flex flex-col">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Gần đây (tối đa 10)</span>
          <button
            v-if="entries.length"
            type="button"
            class="text-[10px] font-medium text-brand hover:underline"
            @click="clearEntries"
          >
            Xóa lịch sử
          </button>
        </div>
        <ul class="text-[11px] font-mono text-gray-600 space-y-0.5 overflow-y-auto max-h-24 pr-1">
          <li v-for="(line, idx) in entries" :key="idx" class="truncate" :title="line">
            {{ line }}
          </li>
          <li v-if="!entries.length" class="text-gray-400 italic">Chưa có phép tính</li>
        </ul>
      </div>
    </div>

    <button
      v-if="!hasExternalTrigger"
      type="button"
      class="shrink-0 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      :class="isOpen ? 'bg-brand text-white ring-2 ring-brand-300' : 'bg-white text-brand ring-1 ring-gray-200 hover:bg-gray-50'"
      aria-label="Máy tính"
      @click="toggleOpen"
    >
      <UIcon name="i-heroicons-calculator" class="text-2xl" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { evaluateExpression } from '~/utils/expressionEvaluator'

type Placement = 'leader' | 'memberDashboard' | 'memberMy'

const props = withDefaults(
  defineProps<{
    placement?: Placement
  }>(),
  { placement: 'leader' },
)

const { entries, pushEntry, clearEntries, loadFromStorage } = useCalculatorHistory()

const slots = useSlots()
const hasExternalTrigger = computed(() => typeof slots.trigger === 'function')

const isOpen = ref(false)
const exprInputRef = ref<HTMLInputElement | null>(null)
const expression = ref('')

const btnBase = 'rounded-xl py-3 text-sm font-semibold transition-colors active:scale-[0.98] flex items-center justify-center min-h-[2.75rem]'
const btnNum = `${btnBase} bg-gray-50 text-gray-900 hover:bg-gray-100 ring-1 ring-gray-200`
const btnOp = `${btnBase} bg-amber-100 text-amber-900 hover:bg-amber-200`
const btnMuted = `${btnBase} bg-gray-100 text-gray-700 hover:bg-gray-200`
const btnEquals = `${btnBase} bg-brand text-white hover:bg-brand-600`

const wrapperClass = computed(() => {
  const zOverlayTop = 'z-[110]'
  if (props.placement === 'memberMy') {
    const z = isOpen.value
      ? zOverlayTop
      : 'z-[35]'
    return `fixed left-3 top-1/2 -translate-y-1/2 ${z} flex flex-row items-start gap-2`
  }
  const bottom = props.placement === 'memberDashboard'
    ? 'bottom-28'
    : 'bottom-6'
  const z = isOpen.value
    ? zOverlayTop
    : (props.placement === 'memberDashboard'
      ? 'z-40'
      : 'z-50')
  return `fixed left-4 ${bottom} ${z} flex flex-col-reverse items-start gap-2`
})

/** Panel shell when parent supplies #trigger (e.g. member dashboard bottom bar) */
const shellClass = computed(() => {
  if (hasExternalTrigger.value) {
    return [
      'fixed z-[110] flex flex-col items-stretch w-[min(100vw-2rem,18rem)]',
      'left-1/2 -translate-x-1/2 bottom-24',
      'sm:left-6 sm:translate-x-0 sm:bottom-28 sm:items-start',
    ].join(' ')
  }
  return wrapperClass.value
})

watch(isOpen, (open) => {
  if (open) {
    loadFromStorage()
    nextTick(() => {
      exprInputRef.value?.focus()
      exprInputRef.value?.select()
    })
  }
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function formatNum(n: number): string {
  if (!Number.isFinite(n)) {
    return 'Lỗi'
  }
  const rounded = Math.round(n * 1e12) / 1e12
  if (Number.isInteger(rounded)) {
    return String(rounded)
  }
  return String(rounded).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '')
}

function prettyForHistory(expr: string): string {
  return expr.replace(/\*/g, '×').replace(/\//g, '÷')
}

function insertAtCaret(text: string) {
  if (expression.value === 'Lỗi') {
    expression.value = ''
  }
  const el = exprInputRef.value
  if (!el) {
    expression.value = (expression.value || '') + text
    return
  }
  const start = el.selectionStart ?? expression.value.length
  const end = el.selectionEnd ?? start
  const cur = expression.value
  expression.value = cur.slice(0, start) + text + cur.slice(end)
  nextTick(() => {
    el.focus()
    const pos = start + text.length
    el.setSelectionRange(pos, pos)
  })
}

function backspace() {
  if (expression.value === 'Lỗi') {
    expression.value = ''
    return
  }
  const el = exprInputRef.value
  if (!el) {
    expression.value = expression.value.slice(0, -1)
    return
  }
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? start
  if (start !== end) {
    expression.value = expression.value.slice(0, start) + expression.value.slice(end)
    nextTick(() => {
      el.focus()
      el.setSelectionRange(start, start)
    })
    return
  }
  if (start <= 0) {
    return
  }
  expression.value = expression.value.slice(0, start - 1) + expression.value.slice(start)
  nextTick(() => {
    el.focus()
    const pos = start - 1
    el.setSelectionRange(pos, pos)
  })
}

function clearEntry() {
  expression.value = ''
}

function clearAll() {
  expression.value = ''
  nextTick(() => exprInputRef.value?.focus())
}

function equals() {
  const raw = expression.value.trim()
  if (raw === '' || raw === 'Lỗi') {
    return
  }
  const result = evaluateExpression(raw)
  if (!result.ok) {
    expression.value = 'Lỗi'
    return
  }
  const resultStr = formatNum(result.value)
  expression.value = resultStr
  pushEntry(`${prettyForHistory(raw)} = ${resultStr}`)
  nextTick(() => {
    const el = exprInputRef.value
    el?.focus()
    el?.setSelectionRange(resultStr.length, resultStr.length)
  })
}

const numpadDigitMap: Record<string, string> = {
  Numpad0: '0',
  Numpad1: '1',
  Numpad2: '2',
  Numpad3: '3',
  Numpad4: '4',
  Numpad5: '5',
  Numpad6: '6',
  Numpad7: '7',
  Numpad8: '8',
  Numpad9: '9',
}

function onExprKeydown(e: KeyboardEvent) {
  if (expression.value === 'Lỗi' && e.key !== 'Escape' && e.key !== 'Tab') {
    expression.value = ''
  }

  if (e.key === 'Enter' || e.key === 'NumpadEnter') {
    e.preventDefault()
    equals()
    return
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    clearAll()
    return
  }

  const mappedDigit = numpadDigitMap[e.code]
  if (mappedDigit) {
    e.preventDefault()
    insertAtCaret(mappedDigit)
    return
  }

  if (e.code === 'NumpadAdd') {
    e.preventDefault()
    insertAtCaret('+')
    return
  }
  if (e.code === 'NumpadSubtract') {
    e.preventDefault()
    insertAtCaret('-')
    return
  }
  if (e.code === 'NumpadMultiply') {
    e.preventDefault()
    insertAtCaret('*')
    return
  }
  if (e.code === 'NumpadDecimal') {
    e.preventDefault()
    insertAtCaret('.')
    return
  }
  if (e.code === 'NumpadDivide') {
    e.preventDefault()
    insertAtCaret('/')
    return
  }
}

/**
 * When panel is open, route numpad keys from elsewhere into the expression (capture on panel).
 */
function onPanelKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    return
  }
  const target = e.target as HTMLElement
  if (target === exprInputRef.value || target.closest?.('input') === exprInputRef.value) {
    return
  }
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }

  const digit = numpadDigitMap[e.code]
  if (digit) {
    e.preventDefault()
    exprInputRef.value?.focus()
    insertAtCaret(digit)
    return
  }
  if (e.code === 'NumpadAdd') {
    e.preventDefault()
    exprInputRef.value?.focus()
    insertAtCaret('+')
    return
  }
  if (e.code === 'NumpadSubtract') {
    e.preventDefault()
    exprInputRef.value?.focus()
    insertAtCaret('-')
    return
  }
  if (e.code === 'NumpadMultiply') {
    e.preventDefault()
    exprInputRef.value?.focus()
    insertAtCaret('*')
    return
  }
  if (e.code === 'NumpadDecimal') {
    e.preventDefault()
    exprInputRef.value?.focus()
    insertAtCaret('.')
    return
  }
  if (e.code === 'NumpadDivide') {
    e.preventDefault()
    exprInputRef.value?.focus()
    insertAtCaret('/')
    return
  }
  if (e.key === 'Enter' || e.key === 'NumpadEnter') {
    e.preventDefault()
    exprInputRef.value?.focus()
    equals()
  }
}
</script>
