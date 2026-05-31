'use client'

import { useActionState, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { addFixedExpense } from '@/actions/expense.actions'
import { addMovement } from '@/actions/movement.actions'
import { MovementExtraFields } from './MovementExtraFields'
import type { FormActionState } from '@/types/form-action'
import type { MovementCurrency, SavingsTarget } from '@/types/movement'
import { movementAmountStep } from '@/lib/amount-input'
import { cn } from '@/lib/utils'

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

type Tab = 'movement' | 'fixed'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30'

const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-400'

interface AddExpenseSheetProps {
  onClose: () => void
}

export function AddExpenseSheet({ onClose }: AddExpenseSheetProps) {
  const [tab, setTab] = useState<Tab>('movement')
  const [movementCurrency, setMovementCurrency] = useState<MovementCurrency>('ARS')
  const [savingsTarget, setSavingsTarget] = useState<SavingsTarget>('none')
  const [fixedState, fixedAction, fixedPending] = useActionState(addFixedExpense, INITIAL)
  const [movementState, movementAction, movementPending] = useActionState(addMovement, INITIAL)

  useEffect(() => {
    if (fixedState.success || movementState.success) {
      onClose()
    }
  }, [fixedState.success, movementState.success, onClose])

  const pending = tab === 'fixed' ? fixedPending : movementPending
  const error = tab === 'fixed' ? fixedState.error : movementState.error

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
          <h2 className="text-base font-semibold text-zinc-50">Agregar gasto</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          <TabButton active={tab === 'movement'} onClick={() => setTab('movement')}>
            Movimiento
          </TabButton>
          <TabButton active={tab === 'fixed'} onClick={() => setTab('fixed')}>
            Gasto fijo
          </TabButton>
        </div>

        {tab === 'movement' ? (
          <form action={movementAction} className="space-y-4">
            <Field label="Descripción" name="description" placeholder="Ej. Supermercado" required />

            <MovementExtraFields
              currency={movementCurrency}
              onCurrencyChange={setMovementCurrency}
              savingsTarget={savingsTarget}
              onSavingsTargetChange={setSavingsTarget}
            />

            <Field
              label="Monto"
              name="amount"
              type="number"
              inputMode="decimal"
              placeholder={movementCurrency === 'CRYPTO' ? '0.0001' : '0'}
              required
              min="0"
              step={movementAmountStep(movementCurrency, savingsTarget)}
            />

            <SelectField label="Categoría" name="category" options={CATEGORIES} />
            <SelectField label="Ícono" name="iconName" options={MOVEMENT_ICONS} />

            <SubmitButton pending={pending} label="Guardar movimiento" />
          </form>
        ) : (
          <form action={fixedAction} className="space-y-4">
            <Field label="Nombre" name="label" placeholder="Ej. Alquiler" required />
            <Field
              label="Monto mensual"
              name="amount"
              type="number"
              inputMode="decimal"
              placeholder="0"
              required
              min="0"
              step="0.01"
            />
            <SelectField label="Ícono" name="iconName" options={FIXED_ICONS} />
            <p className="text-xs text-zinc-500">
              Compromiso que se repite cada mes. Solo resta del presupuesto al marcarlo pagado.
            </p>
            <SubmitButton pending={pending} label="Guardar gasto fijo" />
          </form>
        )}

        {error && (
          <p className="mt-3 text-center text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
        active ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300',
      )}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  name,
  ...props
}: {
  label: string
  name: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input id={name} name={name} className={inputClass} {...props} />
    </div>
  )
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string
  name: string
  options: readonly { value: string; label: string }[]
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <select id={name} name={name} defaultValue={options[0].value} className={inputClass}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileTap={{ scale: 0.97 }}
      className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-50"
    >
      {pending ? 'Guardando…' : label}
    </motion.button>
  )
}
