/**
 * Field names that map to Postgres bigint / identity in this schema.
 * Neon + JSON often serialize these as strings; the Vue app expects numbers.
 */
const BIGINT_ID_FIELD_NAMES = new Set([
  'id',
  'member_id',
  'session_id',
  'court_id',
])

/**
 * Coerce bigint-backed id columns to number for the client.
 */
export function normalizeBigintRow<T extends Record<string, unknown>>(row: T): T {
  const o = { ...row } as Record<string, unknown>
  for (const k of Object.keys(o)) {
    if (!BIGINT_ID_FIELD_NAMES.has(k)) {
      continue
    }
    const v = o[k]
    if (v === null || v === undefined) {
      continue
    }
    if (typeof v === 'number' && Number.isFinite(v)) {
      continue
    }
    const n = Number(v)
    if (!Number.isNaN(n)) {
      o[k] = n
    }
  }
  return o as T
}

export function normalizeBigintRows<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map((r) => normalizeBigintRow(r))
}
