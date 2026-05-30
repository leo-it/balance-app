import { createDbClient } from './client'

export function isMissingTableError(message: string): boolean {
  return (
    message.includes('Could not find the table') ||
    (message.includes('relation') && message.includes('does not exist'))
  )
}

export async function isDatabaseReady(): Promise<boolean> {
  const db = createDbClient()
  const { error } = await db.from('budget_state').select('id').limit(1)

  if (!error) return true
  if (isMissingTableError(error.message)) return false
  throw new Error(error.message)
}
