export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const query = getQuery(event)
  const activeOnly = query.active === 'true' || query.active === '1'

  if (activeOnly) {
    return await sql`
      select id, name, avatar_url, gender
      from members
      where is_active = true
      order by name
    `
  }

  return await sql`
    select id, name, avatar_url, gender, role, is_active
    from members
    order by is_active desc, name
  `
})
