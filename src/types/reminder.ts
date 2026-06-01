export type ReminderRepeat = 'none' | 'daily' | 'weekly' | 'monthly'

export type ReminderEntityType = 'fixed_expense' | 'movement'

export interface EntityReminder {
  notifyDate: string
  notifyTime: string
  repeat: ReminderRepeat
}

export interface ScheduledReminder {
  id: string
  title: string
  body: string
  entityType: ReminderEntityType
  entityId: string
  notifyDate: string
  notifyTime: string
  repeat: ReminderRepeat
}

export const REMINDER_REPEAT_OPTIONS: { value: ReminderRepeat; label: string }[] = [
  { value: 'none', label: 'No repetir' },
  { value: 'daily', label: 'Cada día' },
  { value: 'weekly', label: 'Cada semana' },
  { value: 'monthly', label: 'Cada mes' },
]
