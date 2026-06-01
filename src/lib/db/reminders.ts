import { createDbClient } from './client'
import { isMissingTableError, isRemindersSchemaReady } from './health'
import type { ReminderFormEnabled } from '@/lib/reminder-form'
import type {
  EntityReminder,
  ReminderEntityType,
  ReminderRepeat,
  ScheduledReminder,
} from '@/types/reminder'

interface ReminderRow {
  id: string
  user_id: string
  title: string
  body: string
  entity_type: ReminderEntityType
  entity_id: string
  notify_date: string
  notify_time: string
  repeat_interval: ReminderRepeat
  enabled: boolean
}

function normalizeTime(raw: string): string {
  return raw.slice(0, 5)
}

function toEntityReminder(row: ReminderRow): EntityReminder {
  return {
    notifyDate: row.notify_date,
    notifyTime: normalizeTime(row.notify_time),
    repeat: row.repeat_interval,
  }
}

function toScheduledReminder(row: ReminderRow): ScheduledReminder {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    entityType: row.entity_type,
    entityId: row.entity_id,
    notifyDate: row.notify_date,
    notifyTime: normalizeTime(row.notify_time),
    repeat: row.repeat_interval,
  }
}

export async function getScheduledReminders(
  userId: string,
): Promise<ScheduledReminder[]> {
  if (!(await isRemindersSchemaReady())) return []

  const db = createDbClient()
  const { data, error } = await db
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('enabled', true)

  if (error) throw new Error(error.message)
  if (!data) return []
  return (data as ReminderRow[]).map(toScheduledReminder)
}

export async function getRemindersByEntityIds(
  userId: string,
  entityType: ReminderEntityType,
  entityIds: string[],
): Promise<Map<string, EntityReminder>> {
  const map = new Map<string, EntityReminder>()
  if (entityIds.length === 0) return map
  if (!(await isRemindersSchemaReady())) return map

  const db = createDbClient()
  const { data, error } = await db
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('enabled', true)
    .in('entity_id', entityIds)

  if (error) {
    if (isMissingTableError(error.message)) return map
    throw new Error(error.message)
  }

  for (const row of (data ?? []) as ReminderRow[]) {
    map.set(row.entity_id, toEntityReminder(row))
  }
  return map
}

export async function upsertReminderForEntity(
  userId: string,
  entityType: ReminderEntityType,
  entityId: string,
  title: string,
  body: string,
  input: ReminderFormEnabled,
): Promise<void> {
  if (!(await isRemindersSchemaReady())) {
    throw new Error('Ejecutá la migración 007_reminders.sql en Supabase')
  }

  const db = createDbClient()
  const { error } = await db.from('reminders').upsert(
    {
      user_id: userId,
      title,
      body,
      entity_type: entityType,
      entity_id: entityId,
      notify_date: input.notifyDate,
      notify_time: `${input.notifyTime}:00`,
      repeat_interval: input.repeat,
      enabled: true,
    },
    { onConflict: 'entity_type,entity_id' },
  )

  if (error) throw new Error(error.message)
}

export async function deleteReminderForEntity(
  userId: string,
  entityType: ReminderEntityType,
  entityId: string,
): Promise<void> {
  if (!(await isRemindersSchemaReady())) return

  const db = createDbClient()
  const { error } = await db
    .from('reminders')
    .delete()
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)

  if (error) throw new Error(error.message)
}

export async function syncReminderForEntity(
  userId: string,
  entityType: ReminderEntityType,
  entityId: string,
  title: string,
  body: string,
  input: ReminderFormEnabled | { enabled: false },
): Promise<void> {
  if (!input.enabled) {
    await deleteReminderForEntity(userId, entityType, entityId)
    return
  }
  await upsertReminderForEntity(userId, entityType, entityId, title, body, input)
}
