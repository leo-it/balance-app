'use client'

import { useState } from 'react'
import type { MovementCurrency, MovementType, SavingsTarget } from '@/types/movement'
import { CURRENCY_OPTIONS, SAVINGS_TARGET_OPTIONS } from '@/lib/savings-labels'

const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-400'
const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30'

interface MovementExtraFieldsProps {
  defaultType?: MovementType
  defaultCurrency?: MovementCurrency
  defaultSavingsTarget?: SavingsTarget
  defaultCryptoSymbol?: string
  currency?: MovementCurrency
  onCurrencyChange?: (currency: MovementCurrency) => void
  savingsTarget?: SavingsTarget
  onSavingsTargetChange?: (target: SavingsTarget) => void
}

export function MovementExtraFields({
  defaultType = 'expense',
  defaultCurrency = 'ARS',
  defaultSavingsTarget = 'none',
  defaultCryptoSymbol = '',
  currency: controlledCurrency,
  onCurrencyChange,
  savingsTarget: controlledSavingsTarget,
  onSavingsTargetChange,
}: MovementExtraFieldsProps) {
  const [type, setType] = useState<MovementType>(defaultType)
  const [internalCurrency, setInternalCurrency] = useState<MovementCurrency>(defaultCurrency)
  const [internalSavingsTarget, setInternalSavingsTarget] = useState<SavingsTarget>(defaultSavingsTarget)

  const currency = controlledCurrency ?? internalCurrency
  const savingsTarget = controlledSavingsTarget ?? internalSavingsTarget

  function handleSavingsTargetChange(next: SavingsTarget) {
    if (onSavingsTargetChange) {
      onSavingsTargetChange(next)
    } else {
      setInternalSavingsTarget(next)
    }
    if (next === 'crypto') {
      handleCurrencyChange('CRYPTO')
    }
  }

  function handleCurrencyChange(next: MovementCurrency) {
    if (onCurrencyChange) {
      onCurrencyChange(next)
    } else {
      setInternalCurrency(next)
    }
  }

  const showCryptoSymbol =
    currency === 'CRYPTO' || (type === 'income' && savingsTarget === 'crypto')

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
            ¿Aportar al ahorro?
          </label>
          <select
            id="savingsTarget"
            name="savingsTarget"
            value={savingsTarget}
            onChange={(e) => handleSavingsTargetChange(e.target.value as SavingsTarget)}
            className={inputClass}
          >
            {SAVINGS_TARGET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="currency" className={labelClass}>
          Moneda
        </label>
        <select
          id="currency"
          name="currency"
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value as MovementCurrency)}
          className={inputClass}
        >
          {CURRENCY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {showCryptoSymbol && (
        <div>
          <label htmlFor="cryptoSymbol" className={labelClass}>
            Símbolo cripto
          </label>
          <input
            id="cryptoSymbol"
            name="cryptoSymbol"
            defaultValue={defaultCryptoSymbol}
            placeholder="Ej. BTC, ETH, USDT"
            className={inputClass}
            required
          />
        </div>
      )}
    </>
  )
}
