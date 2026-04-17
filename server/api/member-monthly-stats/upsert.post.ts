export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const body = await readBody<{
    member_id: number
    year_month: string
    is_paid: boolean
    paid_at: string | null
    total_fee: number
    extra_fee: number
    grand_total: number
    sessions_attended: number
    cumulative_total: number
  }>(event)

  await sql`
    insert into member_monthly_stats (
      member_id,
      year_month,
      total_fee,
      extra_fee,
      grand_total,
      sessions_attended,
      cumulative_total,
      is_paid,
      paid_at
    )
    values (
      ${body.member_id},
      ${body.year_month},
      ${body.total_fee},
      ${body.extra_fee},
      ${body.grand_total},
      ${body.sessions_attended},
      ${body.cumulative_total},
      ${body.is_paid},
      ${body.paid_at}
    )
    on conflict (member_id, year_month) do update set
      total_fee = excluded.total_fee,
      extra_fee = excluded.extra_fee,
      grand_total = excluded.grand_total,
      sessions_attended = excluded.sessions_attended,
      cumulative_total = excluded.cumulative_total,
      is_paid = excluded.is_paid,
      paid_at = excluded.paid_at,
      updated_at = now()
  `
  return { ok: true }
})
