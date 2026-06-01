'use client'

import { useEffect } from 'react'
import { syncRemindersToNative } from '@/lib/capacitor/reminder-notifications'
import type { ScheduledReminder } from '@/types/reminder'

interface ReminderNativeSyncProps {
  reminders: ScheduledReminder[]
}

export function ReminderNativeSync({ reminders }: ReminderNativeSyncProps) {
  useEffect(() => {
    void syncRemindersToNative(reminders)
  }, [reminders])

  return null
}
