'use client'

import { useActionState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { updateMovement } from '@/actions/movement.actions'
import { MovementExtraFields } from './MovementExtraFields'
import type { FormActionState } from '@/types/form-action'
import type { Movement } from '@/types/movement'

const INITIAL: FormActionState = { error: null }

const MOVEMENT_ICONS = [
  { value: 'Receipt', label: 'General' },
  { value: 'ShoppingCart', label: 'Compras' },
  { value: 'Utensils', label: 'Comida' },
  { value: 'Fuel', label: 'Nafta' },
  { value: 'Bus', label: 'Transporte' },
  { value: 'Coffee', label: 'Café' },
  { value: 'Pill', label: 'Salud' },
  { value: 'Banknote', label: 'Ingreso' },
] as const

const CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'Comida', label: 'Comida' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Salud', label: 'Salud' },
  { value: 'Hogar', label: 'Hogar' },
  { value: 'Ingresos', label: 'Ingresos' },
] as const

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30'

const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-400'

interface EditMovementSheetProps {
  movement: Movement
  onClose: () => void
}

export function EditMovementSheet({ movement, onClose }: EditMovementSheetProps) {
  const [state, action, pending] = useActionState(updateMovement, INITIAL)

  useEffect(() => {
    if (state.success) onClose()
  }, [state.success, onClose])

  return (
    <AnimatePresence>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90dvh] max-w-md overflow-y-auto rounded-t-2xl border border-zinc-800 bg-zinc-900 px-4 pb-8 pt-3"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-50">Editar movimiento</h2>
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
          <input type="hidden" name="movementId" value={movement.id} />

          <div>
            <label htmlFor="description" className={labelClass}>
              Descripción
            </label>
            <input
              id="description"
              name="description"
              defaultValue={movement.description}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className={labelClass}>
              Monto
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              defaultValue={movement.amount}
              className={inputClass}
              required
              min="0"
              step="0.01"
            />
          </div>

          <MovementExtraFields
            defaultType={movement.type}
            defaultCurrency={movement.currency}
            defaultSavingsTarget={movement.savingsTarget}
          />

          <div>
            <label htmlFor="category" className={labelClass}>
              Categoría
            </label>
            <select
              id="category"
              name="category"
              defaultValue={movement.category}
              className={inputClass}
            >
              {CATEGORIES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="iconName" className={labelClass}>
              Ícono
            </label>
            <select
              id="iconName"
              name="iconName"
              defaultValue={movement.iconName}
              className={inputClass}
            >
              {MOVEMENT_ICONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

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
