export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const body = await readBody<{
    session_id: number
    member_id: number
    is_present: boolean
    fee_amount: number
    guest_fee: number
  }>(event)

  await sql`
    insert into session_attendances (session_id, member_id, is_present, fee_amount, guest_fee)
    values (
      ${body.session_id},
      ${body.member_id},
      ${body.is_present},
      ${body.fee_amount},
      ${body.guest_fee}
    )
    on conflict (session_id, member_id) do update set
      is_present = excluded.is_present,
      fee_amount = excluded.fee_amount,
      guest_fee = excluded.guest_fee,
      updated_at = now()
  `
  return { ok: true }
})
