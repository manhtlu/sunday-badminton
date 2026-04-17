export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const body = await readBody<{
    name: string
    address: string
    directions?: string | null
    court_fee?: number
    is_active?: boolean
  }>(event)

  const rows = await sql`
    insert into courts (name, address, directions, court_fee, is_active)
    values (
      ${body.name},
      ${body.address},
      ${body.directions ?? null},
      ${body.court_fee ?? 0},
      ${body.is_active ?? true}
    )
    returning id
  `
  return rows[0]
})
