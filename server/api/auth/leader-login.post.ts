export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const body = await readBody<{ accessCode?: string }>(event)
  const accessCode = body.accessCode?.trim() ?? ''

  if (!accessCode) {
    return null
  }

  const rows = await sql`
    select id, name, role
    from members
    where role = 'leader'
      and access_code = ${accessCode}
    limit 1
  `
  return rows[0] ?? null
})
