/**
 * Calendar timezone for session rows (Vietnam local dates in DB / operations).
 * Fixes ISO datetimes like `...T17:00:00.000Z` mapping to the next calendar day in VN.
 */
const SESSION_CALENDAR_TIMEZONE = 'Asia/Ho_Chi_Minh'

function ymdInTimeZone(d: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const y = parts.find((p) => p.type === 'year')?.value ?? ''
  const mo = parts.find((p) => p.type === 'month')?.value ?? ''
  const day = parts.find((p) => p.type === 'day')?.value ?? ''
  if (!y || !mo || !day) {
    return ''
  }
  return `${y}-${mo}-${day}`
}

/**
 * Normalize Postgres / JSON date values to `yyyy-MM-dd` for <input type="date">.
 * - Plain `YYYY-MM-DD` (Postgres `date` as string) is returned as-is.
 * - ISO strings with a time part are converted using the session calendar TZ (not UTC prefix).
 * - `Date` values use the same TZ (avoids local-browser off-by-one vs DB).
 */
export function toDateInputValue(value: unknown): string {
  if (value == null || value === '') {
    return ''
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const normalized = trimmed.includes('T')
        ? trimmed
        : trimmed.replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T')
      if (/^\d{4}-\d{2}-\d{2}T/.test(normalized)) {
        const d = new Date(normalized)
        if (!Number.isNaN(d.getTime())) {
          return ymdInTimeZone(d, SESSION_CALENDAR_TIMEZONE)
        }
      }
    }
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return ymdInTimeZone(value, SESSION_CALENDAR_TIMEZONE)
  }
  return ''
}

/** “Today” as calendar date in the team timezone (for session defaults). */
export function getTodayYmd(): string {
  return ymdInTimeZone(new Date(), SESSION_CALENDAR_TIMEZONE)
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
