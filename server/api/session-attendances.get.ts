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
    return await sql`
      select session_id, fee_amount, guest_fee, is_present
      from session_attendances
      where member_id = ${memberId}
        and session_id = any(${ids}::bigint[])
    `
  }

  return await sql`
    select *
    from session_attendances
    where session_id = any(${ids}::bigint[])
  `
})
