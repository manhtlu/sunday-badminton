export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const body = await readBody<Record<string, unknown>>(event)

  let courtId =
    body.court_id != null && body.court_id !== ''
      ? Number(body.court_id)
      : NaN
  if (!courtId || Number.isNaN(courtId)) {
    const rows = await sql`
      select id
      from courts
      where is_active = true
      order by id
      limit 1
    `
    if (!rows.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No court available; create a court first',
      })
    }
    courtId = Number(rows[0].id)
  }

  const rows = await sql`
    insert into sessions (
      court_id,
      session_date,
      status,
      shuttlecock_quantity,
      shuttlecock_price_per_unit,
      court_fee,
      misc_fee,
      misc_fee_note,
      male_split_fee,
      female_split_fee,
      total_fee,
      attendee_count,
      guest_note,
      note,
      name,
      start_time,
      end_time
    )
    values (
      ${courtId},
      ${body.session_date as string},
      ${(body.status as string) ?? 'planned'},
      ${Number(body.shuttlecock_quantity ?? 0)},
      ${Number(body.shuttlecock_price_per_unit ?? 0)},
      ${Number(body.court_fee ?? 0)},
      ${Number(body.misc_fee ?? 0)},
      ${(body.misc_fee_note as string | null) ?? null},
      ${Number(body.male_split_fee ?? 0)},
      ${Number(body.female_split_fee ?? 0)},
      ${Number(body.total_fee ?? 0)},
      ${Number(body.attendee_count ?? 0)},
      ${(body.guest_note as string | null) ?? null},
      ${(body.note as string | null) ?? null},
      ${(body.name as string | null) ?? 'Sinh hoạt nội bộ'},
      ${(body.start_time as string | null) ?? '19:30'},
      ${(body.end_time as string | null) ?? '21:30'}
    )
    returning id
  `
  return normalizeBigintRow(rows[0] as Record<string, unknown>)
})
