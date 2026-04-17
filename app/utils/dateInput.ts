/**
 * Normalize Postgres / JSON date values to `yyyy-MM-dd` for <input type="date">.
 * Neon and some drivers return ISO strings with a time part, which breaks date inputs.
 */
export function toDateInputValue(value: unknown): string {
  if (value == null || value === '') {
    return ''
  }
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/)
    if (m) {
      return m[1]
    }
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear()
    const mo = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${mo}-${d}`
  }
  return ''
}

/** Local calendar date as `yyyy-MM-dd` (for HTML date input defaults). */
export function getTodayYmd(): string {
  const d = new Date()
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

/**
 * Parse PostgreSQL `date` / `yyyy-MM-dd` without timezone shift.
 * `new Date('2026-04-30')` is UTC midnight and shows wrong calendar day in some zones.
 */
export function parseDateOnlyParts(value: unknown): { y: number; m: number; d: number } | null {
  const s = toDateInputValue(value)
  if (!s) {
    return null
  }
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) {
    return null
  }
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) }
}

/** Short display d/m (Vietnamese), safe for date-only DB values. */
export function formatDateDdMm(value: unknown): string {
  const p = parseDateOnlyParts(value)
  if (!p) {
    return ''
  }
  return `${p.d}/${p.m}`
}
