'use client'

import { useState } from 'react'

const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-400'
const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30'

export function MovementExtraFields() {
  const [type, setType] = useState<'expense' | 'income'>('expense')

  return (
    <>
      <div>
        <span className={labelClass}>Tipo</span>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex cursor-pointer items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 text-sm has-[:checked]:border-emerald-500/50 has-[:checked]:bg-emerald-500/10 has-[:checked]:text-emerald-400">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={type === 'expense'}
              onChange={() => setType('expense')}
              className="sr-only"
            />
            Gasto
          </label>
          <label className="flex cursor-pointer items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 text-sm has-[:checked]:border-emerald-500/50 has-[:checked]:bg-emerald-500/10 has-[:checked]:text-emerald-400">
            <input
              type="radio"
              name="type"
              value="income"
              checked={type === 'income'}
              onChange={() => setType('income')}
              className="sr-only"
            />
            Ingreso
          </label>
        </div>
      </div>

      {type === 'income' && (
        <div>
          <label htmlFor="savingsTarget" className={labelClass}>
            ¿Aportar a ahorro?
          </label>
          <select id="savingsTarget" name="savingsTarget" defaultValue="none" className={inputClass}>
            <option value="none">No, suma al presupuesto del mes</option>
            <option value="ars">Sí, jar ARS</option>
            <option value="usd">Sí, jar USD</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="currency" className={labelClass}>
          Moneda
        </label>
        <select id="currency" name="currency" defaultValue="ARS" className={inputClass}>
          <option value="ARS">Pesos (ARS)</option>
          <option value="USD">Dólares (USD)</option>
        </select>
      </div>
    </>
  )
}
