export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const body = await readBody<{
    name: string
    gender: string
    avatar_url?: string | null
    role?: string
    is_active?: boolean
    access_code?: string | null
  }>(event)

  const rows = await sql`
    insert into members (name, gender, avatar_url, role, is_active)
    values (
      ${body.name},
      ${body.gender},
      ${body.avatar_url ?? null},
      ${body.role ?? 'member'},
      ${body.is_active ?? true}
    )
    returning id
  `
  return rows[0]
})
