'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import type { EntityReminder } from '@/types/reminder'
import { REMINDER_REPEAT_OPTIONS } from '@/types/reminder'
import { defaultNotifyDate } from '@/lib/reminder-form'
import { cn } from '@/lib/utils'

const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-400'
const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30'

interface ReminderFieldsProps {
  initial?: EntityReminder | null
}

export function ReminderFields({ initial }: ReminderFieldsProps) {
  const [enabled, setEnabled] = useState(Boolean(initial))

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
      <input type="hidden" name="notifyEnabled" value={enabled ? '1' : '0'} />

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="accent-emerald-500"
        />
        <span className="flex items-center gap-2 text-sm text-zinc-200">
          <Bell size={15} className="text-amber-400" />
          Notificarme en el celular
        </span>
      </label>

      {enabled && (
        <div className={cn('mt-3 grid gap-3', 'grid-cols-2')}>
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="notifyDate" className={labelClass}>
              Fecha
            </label>
            <input
              id="notifyDate"
              name="notifyDate"
              type="date"
              required
              defaultValue={initial?.notifyDate ?? defaultNotifyDate()}
              className={inputClass}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="notifyTime" className={labelClass}>
              Hora
            </label>
            <input
              id="notifyTime"
              name="notifyTime"
              type="time"
              required
              defaultValue={initial?.notifyTime ?? '09:00'}
              className={inputClass}
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="notifyRepeat" className={labelClass}>
              Repetir
            </label>
            <select
              id="notifyRepeat"
              name="notifyRepeat"
              defaultValue={initial?.repeat ?? 'monthly'}
              className={inputClass}
            >
              {REMINDER_REPEAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <p className="col-span-2 text-xs text-zinc-600">
            Requiere la APK Android instalada. En la web solo se guarda el recordatorio.
          </p>
        </div>
      )}
    </div>
  )
}
