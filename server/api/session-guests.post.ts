export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const body = await readBody<{
    session_id: number
    member_id?: number | null
    guest_name: string
    fee_amount: number
    note?: string | null
  }>(event)

  await sql`
    insert into session_guests (session_id, member_id, guest_name, fee_amount, note)
    values (
      ${body.session_id},
      ${body.member_id ?? null},
      ${body.guest_name},
      ${body.fee_amount},
      ${body.note ?? null}
    )
  `
  return { ok: true }
})
