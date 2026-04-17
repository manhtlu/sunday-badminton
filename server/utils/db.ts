import { neon } from '@neondatabase/serverless'

export function useNeon() {
  const config = useRuntimeConfig()
  const url = config.databaseUrl
  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 500,
      statusMessage: 'DATABASE_URL is not configured',
    })
  }
  return neon(url)
}
