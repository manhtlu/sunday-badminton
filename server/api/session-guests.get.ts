export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const query = getQuery(event)
  const sessionIdsRaw = query.sessionIds as string | undefined
  const memberId = query.memberId as string | undefined

  if (!sessionIdsRaw) {
    return []
  }

  const ids = sessionIdsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!ids.length) {
    return []
  }

  if (memberId) {
    const rows = await sql`
      select session_id, guest_name, fee_amount
      from session_guests
      where member_id = ${memberId}
        and session_id = any(${ids}::bigint[])
    `
    return normalizeBigintRows(rows as Record<string, unknown>[])
  }

  const rows = await sql`
    select *
    from session_guests
    where session_id = any(${ids}::bigint[])
  `
  return normalizeBigintRows(rows as Record<string, unknown>[])
})
