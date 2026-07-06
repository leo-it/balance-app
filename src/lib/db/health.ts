import { createDbClient } from './client'

export function isConnectionError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('fetch failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('econnrefused') ||
    lower.includes('enotfound') ||
    lower.includes('etimedout') ||
    lower.includes('network') ||
    lower.includes('socket hang up')
  )
}

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

export async function isDatabaseReachable(): Promise<boolean> {
  const db = createDbClient()
  const { error } = await db.from('budget_state').select('id').limit(1)

  if (!error) return true
  if (isMissingTableError(error.message)) return true
  if (isConnectionError(error.message)) return false
  return true
}

export async function isDatabaseReady(): Promise<boolean> {
  const db = createDbClient()
  const { error } = await db.from('budget_state').select('id').limit(1)

  if (!error) return true
  if (isMissingTableError(error.message)) return false
  if (isConnectionError(error.message)) return false
  throw new Error(error.message)
}

export async function isDualCurrencySchemaReady(): Promise<boolean> {
  const db = createDbClient()
  const { error } = await db.from('movements').select('currency').limit(1)

  if (!error) return true
  if (isMissingColumnError(error.message)) return false
  if (isMissingTableError(error.message)) return false
  if (isConnectionError(error.message)) return false
  throw new Error(error.message)
}

export async function isRemindersSchemaReady(): Promise<boolean> {
  const db = createDbClient()
  const { error } = await db.from('reminders').select('id').limit(1)

  if (!error) return true
  if (isMissingTableError(error.message)) return false
  if (isConnectionError(error.message)) return false
  throw new Error(error.message)
}
