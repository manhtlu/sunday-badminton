export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const body = await readBody<Record<string, unknown>>(event)

  if (body.name !== undefined) {
    await sql`update members set name = ${body.name as string} where id = ${id}`
  }
  if (body.gender !== undefined) {
    await sql`update members set gender = ${body.gender as string} where id = ${id}`
  }
  if (body.avatar_url !== undefined) {
    await sql`update members set avatar_url = ${body.avatar_url as string | null} where id = ${id}`
  }
  if (body.is_active !== undefined) {
    await sql`update members set is_active = ${body.is_active as boolean} where id = ${id}`
  }
  if (body.access_code !== undefined) {
    await sql`update members set access_code = ${body.access_code as string | null} where id = ${id}`
  }
  if (body.role !== undefined) {
    await sql`update members set role = ${body.role as string} where id = ${id}`
  }

  return { ok: true }
})
