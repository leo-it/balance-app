import { createDbClient } from './client'

export function isMissingTableError(message: string): boolean {
  return (
    message.includes('Could not find the table') ||
    (message.includes('relation') && message.includes('does not exist'))
  )
}

export function isMissingColumnError(message: string): boolean {
  return (
    (message.includes('column') && message.includes('does not exist')) ||
    (message.includes('Could not find the') &&
      message.includes('column') &&
      message.includes('schema cache'))
  )
}

export async function isDatabaseReady(): Promise<boolean> {
  const db = createDbClient()
  const { error } = await db.from('budget_state').select('id').limit(1)

  if (!error) return true
  if (isMissingTableError(error.message)) return false
  throw new Error(error.message)
}

export async function isDualCurrencySchemaReady(): Promise<boolean> {
  const db = createDbClient()
  const { error } = await db.from('movements').select('currency').limit(1)

  if (!error) return true
  if (isMissingColumnError(error.message)) return false
  if (isMissingTableError(error.message)) return false
  throw new Error(error.message)
}

export async function isRemindersSchemaReady(): Promise<boolean> {
  const db = createDbClient()
  const { error } = await db.from('reminders').select('id').limit(1)

  if (!error) return true
  if (isMissingTableError(error.message)) return false
  throw new Error(error.message)
}
