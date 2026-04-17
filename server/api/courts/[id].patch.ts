export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const body = await readBody<Record<string, unknown>>(event)

  if (body.name !== undefined) {
    await sql`update courts set name = ${body.name as string} where id = ${id}`
  }
  if (body.address !== undefined) {
    await sql`update courts set address = ${body.address as string} where id = ${id}`
  }
  if (body.directions !== undefined) {
    await sql`update courts set directions = ${body.directions as string | null} where id = ${id}`
  }
  if (body.court_fee !== undefined) {
    await sql`update courts set court_fee = ${Number(body.court_fee)} where id = ${id}`
  }
  if (body.is_active !== undefined) {
    await sql`update courts set is_active = ${body.is_active as boolean} where id = ${id}`
  }

  return { ok: true }
})
