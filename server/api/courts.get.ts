export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const query = getQuery(event)
  const listMode = query.list === '1' || query.list === 'true'
  const activeOnly = query.active === 'true' || query.active === '1'

  if (listMode) {
    const rows = await sql`
      select id, name
      from courts
      order by name
    `
    return normalizeBigintRows(rows as Record<string, unknown>[])
  }

  if (activeOnly) {
    const rows = await sql`
      select id, name, court_fee
      from courts
      where is_active = true
      order by name
    `
    return normalizeBigintRows(rows as Record<string, unknown>[])
  }

  const rows = await sql`
    select id, name, address, directions, court_fee, is_active
    from courts
    order by is_active desc, name
  `
  return normalizeBigintRows(rows as Record<string, unknown>[])
})
