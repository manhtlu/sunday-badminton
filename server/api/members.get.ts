export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const query = getQuery(event)
  const activeOnly = query.active === 'true' || query.active === '1'

  if (activeOnly) {
    const rows = await sql`
      select id, name, avatar_url, gender
      from members
      where is_active = true
      order by name
    `
    return normalizeBigintRows(rows as Record<string, unknown>[])
  }

  const rows = await sql`
    select id, name, avatar_url, gender, role, is_active
    from members
    order by is_active desc, name
  `
  return normalizeBigintRows(rows as Record<string, unknown>[])
})
