import { Capacitor } from '@capacitor/core'
import type { ReminderRepeat, ScheduledReminder } from '@/types/reminder'

function reminderNotificationId(reminderId: string): number {
  let hash = 0
  for (let i = 0; i < reminderId.length; i += 1) {
    hash = (hash << 5) - hash + reminderId.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 2147483646 + 1
}

function combineLocalDateTime(notifyDate: string, notifyTime: string): Date {
  const [year, month, day] = notifyDate.split('-').map(Number)
  const [hour, minute] = notifyTime.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute, 0, 0)
}

function repeatEvery(repeat: ReminderRepeat): 'day' | 'week' | 'month' | null {
  if (repeat === 'daily') return 'day'
  if (repeat === 'weekly') return 'week'
  if (repeat === 'monthly') return 'month'
  return null
}

function nextFutureOccurrence(at: Date, repeat: ReminderRepeat): Date {
  if (repeat === 'none') return at
  const next = new Date(at)
  const now = new Date()
  while (next <= now) {
    if (repeat === 'daily') next.setDate(next.getDate() + 1)
    else if (repeat === 'weekly') next.setDate(next.getDate() + 7)
    else next.setMonth(next.getMonth() + 1)
  }
  return next
}

function buildSchedule(at: Date, repeat: ReminderRepeat) {
  const every = repeatEvery(repeat)
  if (!every) return { at }
  return { at, every, allowWhileIdle: true }
}

export async function syncRemindersToNative(reminders: ScheduledReminder[]): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  const { LocalNotifications } = await import('@capacitor/local-notifications')
  const permission = await LocalNotifications.requestPermissions()
  if (permission.display !== 'granted') return

  const pending = await LocalNotifications.getPending()
  const existingIds = new Set(pending.notifications.map((n) => n.id))
  const nextIds = new Set(reminders.map((r) => reminderNotificationId(r.id)))

  const toCancel = [...existingIds].filter((id) => !nextIds.has(id))
  if (toCancel.length > 0) {
    await LocalNotifications.cancel({
      notifications: toCancel.map((id) => ({ id })),
    })
  }

  if (reminders.length === 0) return

  const notifications = reminders.map((reminder) => {
    let at = combineLocalDateTime(reminder.notifyDate, reminder.notifyTime)
    at = nextFutureOccurrence(at, reminder.repeat)

    return {
      id: reminderNotificationId(reminder.id),
      title: reminder.title,
      body: reminder.body,
      schedule: buildSchedule(at, reminder.repeat),
      extra: {
        entityType: reminder.entityType,
        entityId: reminder.entityId,
      },
    }
  })

  await LocalNotifications.schedule({ notifications })
}
