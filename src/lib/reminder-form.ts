import type { ReminderRepeat } from '@/types/reminder'

export interface ReminderFormEnabled {
  enabled: true
  notifyDate: string
  notifyTime: string
  repeat: ReminderRepeat
}

export type ReminderFormInput =
  | { enabled: false }
  | (ReminderFormEnabled & { error?: undefined })
  | { enabled: true; error: string }

const REPEAT_VALUES = new Set<ReminderRepeat>(['none', 'daily', 'weekly', 'monthly'])

function parseRepeat(raw: FormDataEntryValue | null): ReminderRepeat {
  const value = String(raw ?? 'none')
  return REPEAT_VALUES.has(value as ReminderRepeat) ? (value as ReminderRepeat) : 'none'
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`))
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export function parseReminderForm(formData: FormData): ReminderFormInput {
  const enabled = String(formData.get('notifyEnabled') ?? '0') === '1'
  if (!enabled) return { enabled: false }

  const notifyDate = String(formData.get('notifyDate') ?? '').trim()
  const notifyTime = String(formData.get('notifyTime') ?? '').trim()
  const repeat = parseRepeat(formData.get('notifyRepeat'))

  if (!notifyDate || !notifyTime) {
    return { enabled: true, error: 'Elegí fecha y hora para la notificación' }
  }
  if (!isValidDate(notifyDate)) {
    return { enabled: true, error: 'Fecha de notificación no válida' }
  }
  if (!isValidTime(notifyTime)) {
    return { enabled: true, error: 'Hora de notificación no válida' }
  }

  return { enabled: true, notifyDate, notifyTime, repeat }
}

export function isReminderFormEnabled(input: ReminderFormInput): input is ReminderFormEnabled {
  return input.enabled && !('error' in input)
}

export function defaultNotifyDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
