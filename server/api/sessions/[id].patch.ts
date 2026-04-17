export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const body = await readBody<Record<string, unknown>>(event)

  if (body.court_id !== undefined) {
    await sql`update sessions set court_id = ${Number(body.court_id)} where id = ${id}`
  }
  if (body.session_date !== undefined) {
    await sql`update sessions set session_date = ${body.session_date as string} where id = ${id}`
  }
  if (body.status !== undefined) {
    await sql`update sessions set status = ${body.status as string} where id = ${id}`
  }
  if (body.shuttlecock_quantity !== undefined) {
    await sql`update sessions set shuttlecock_quantity = ${Number(body.shuttlecock_quantity)} where id = ${id}`
  }
  if (body.shuttlecock_price_per_unit !== undefined) {
    await sql`update sessions set shuttlecock_price_per_unit = ${Number(body.shuttlecock_price_per_unit)} where id = ${id}`
  }
  if (body.court_fee !== undefined) {
    await sql`update sessions set court_fee = ${Number(body.court_fee)} where id = ${id}`
  }
  if (body.misc_fee !== undefined) {
    await sql`update sessions set misc_fee = ${Number(body.misc_fee)} where id = ${id}`
  }
  if (body.misc_fee_note !== undefined) {
    await sql`update sessions set misc_fee_note = ${body.misc_fee_note as string | null} where id = ${id}`
  }
  if (body.male_split_fee !== undefined) {
    await sql`update sessions set male_split_fee = ${Number(body.male_split_fee)} where id = ${id}`
  }
  if (body.female_split_fee !== undefined) {
    await sql`update sessions set female_split_fee = ${Number(body.female_split_fee)} where id = ${id}`
  }
  if (body.total_fee !== undefined) {
    await sql`update sessions set total_fee = ${Number(body.total_fee)} where id = ${id}`
  }
  if (body.attendee_count !== undefined) {
    await sql`update sessions set attendee_count = ${Number(body.attendee_count)} where id = ${id}`
  }
  if (body.guest_note !== undefined) {
    await sql`update sessions set guest_note = ${body.guest_note as string | null} where id = ${id}`
  }
  if (body.note !== undefined) {
    await sql`update sessions set note = ${body.note as string | null} where id = ${id}`
  }
  if (body.name !== undefined) {
    await sql`update sessions set name = ${body.name as string} where id = ${id}`
  }
  if (body.start_time !== undefined) {
    await sql`update sessions set start_time = ${body.start_time as string} where id = ${id}`
  }
  if (body.end_time !== undefined) {
    await sql`update sessions set end_time = ${body.end_time as string} where id = ${id}`
  }

  return { ok: true }
})
