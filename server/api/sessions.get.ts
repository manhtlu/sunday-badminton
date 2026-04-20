export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const query = getQuery(event)
  const startDate = query.startDate as string | undefined
  const endDate = query.endDate as string | undefined
  const fields = (query.fields as string | undefined) ?? 'full'

  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, statusMessage: 'startDate and endDate are required' })
  }

  if (fields === 'schedule') {
    const rows = await sql`
      select id, session_date, name, start_time, end_time, court_id
      from sessions
      where session_date >= ${startDate}
        and session_date <= ${endDate}
      order by start_time
    `
    return normalizeBigintRows(rows as Record<string, unknown>[])
  }

  const rows = await sql`
    select *
    from sessions
    where session_date >= ${startDate}
      and session_date <= ${endDate}
    order by session_date
  `
  return normalizeBigintRows(rows as Record<string, unknown>[])
})
