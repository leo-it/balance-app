'use client'

import { useActionState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { updateFixedExpense } from '@/actions/expense.actions'
import { ReminderFields } from '@/components/reminders/ReminderFields'
import type { FormActionState } from '@/types/form-action'
import type { FixedExpense } from '@/types/expense'

const INITIAL: FormActionState = { error: null }

const FIXED_ICONS = [
  { value: 'Receipt', label: 'General' },
  { value: 'Home', label: 'Hogar' },
  { value: 'Wifi', label: 'Internet' },
  { value: 'Shield', label: 'Seguro' },
  { value: 'Dumbbell', label: 'Gimnasio' },
  { value: 'Music', label: 'Suscripción' },
  { value: 'Tv', label: 'TV' },
  { value: 'Car', label: 'Auto' },
  { value: 'Zap', label: 'Servicios' },
] as const

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30'

const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-400'

interface EditFixedExpenseSheetProps {
  expense: FixedExpense
  onClose: () => void
}

export function EditFixedExpenseSheet({ expense, onClose }: EditFixedExpenseSheetProps) {
  const [state, action, pending] = useActionState(updateFixedExpense, INITIAL)

  useEffect(() => {
    if (state.success) onClose()
  }, [state.success, onClose])

  return (
    <AnimatePresence>
      <motion.button
        key="backdrop"
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90dvh] max-w-md overflow-y-auto rounded-t-2xl border border-zinc-800 bg-zinc-900 px-4 pb-8 pt-3"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-50">Editar gasto fijo</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="expenseId" value={expense.id} />

          <div>
            <label htmlFor="label" className={labelClass}>
              Nombre
            </label>
            <input
              id="label"
              name="label"
              defaultValue={expense.label}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className={labelClass}>
              Monto mensual
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              defaultValue={expense.amount}
              className={inputClass}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="iconName" className={labelClass}>
              Ícono
            </label>
            <select
              id="iconName"
              name="iconName"
              defaultValue={expense.iconName}
              className={inputClass}
            >
              {FIXED_ICONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <ReminderFields initial={expense.reminder} />

          <motion.button
            type="submit"
            disabled={pending}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-50"
          >
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </motion.button>
        </form>

        {state.error && (
          <p className="mt-3 text-center text-sm text-red-500" role="alert">
            {state.error}
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
