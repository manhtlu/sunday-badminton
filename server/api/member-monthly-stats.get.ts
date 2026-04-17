export default defineEventHandler(async (event) => {
  const sql = useNeon()
  const query = getQuery(event)
  const yearMonth = query.yearMonth as string | undefined
  const memberId = query.memberId as string | undefined

  if (memberId && !yearMonth) {
    return await sql`
      select year_month, is_paid
      from member_monthly_stats
      where member_id = ${memberId}
    `
  }

  if (yearMonth) {
    return await sql`
      select member_id, is_paid
      from member_monthly_stats
      where year_month = ${yearMonth}
    `
  }

  throw createError({ statusCode: 400, statusMessage: 'yearMonth or memberId required' })
})
