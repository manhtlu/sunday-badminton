export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  await sql`delete from courts where id = ${id}`
  return { ok: true }
})
