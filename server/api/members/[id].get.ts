export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const rows = await sql`
    select id, name, avatar_url, gender
    from members
    where id = ${id}
  `
  return rows[0] ?? null
})
