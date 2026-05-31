'use client'

import { useActionState, useEffect } from 'react'
import { updateBudgetSettings } from '@/actions/budget.actions'
import type { BudgetState } from '@/types/budget'
import type { FormActionState } from '@/types/form-action'

const INITIAL: FormActionState = { error: null }

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500/50 focus:outline-none'

interface BudgetSettingsFormProps {
  budget: BudgetState
}

export function BudgetSettingsForm({ budget }: BudgetSettingsFormProps) {
  const [state, action, pending] = useActionState(updateBudgetSettings, INITIAL)

  useEffect(() => {
    if (state.success) {
      // revalidate handled server-side
    }
  }, [state.success])

  return (
    <form action={action} className="space-y-4 py-4">
      <div>
        <label htmlFor="monthlyBudget" className="text-sm font-medium text-zinc-200">
          Presupuesto mensual (ARS)
        </label>
        <input
          id="monthlyBudget"
          name="monthlyBudget"
          type="number"
          min="0"
          step="1"
          defaultValue={budget.monthlyBudget || ''}
          className={inputClass}
          placeholder="Ej. 130000"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="savingsArsGoal" className="text-sm font-medium text-zinc-200">
            Meta ahorro ARS
          </label>
          <input
            id="savingsArsGoal"
            name="savingsArsGoal"
            type="number"
            min="0"
            step="1"
            defaultValue={budget.savings.arsGoal || ''}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="savingsArsCurrent" className="text-sm font-medium text-zinc-200">
            Saldo actual ARS
          </label>
          <input
            id="savingsArsCurrent"
            name="savingsArsCurrent"
            type="number"
            min="0"
            step="1"
            defaultValue={budget.savings.arsCurrent || ''}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="savingsUsdGoal" className="text-sm font-medium text-zinc-200">
            Meta ahorro USD
          </label>
          <input
            id="savingsUsdGoal"
            name="savingsUsdGoal"
            type="number"
            min="0"
            step="0.01"
            defaultValue={budget.savings.usdGoal || ''}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="savingsUsdCurrent" className="text-sm font-medium text-zinc-200">
            Saldo actual USD
          </label>
          <input
            id="savingsUsdCurrent"
            name="savingsUsdCurrent"
            type="number"
            min="0"
            step="0.01"
            defaultValue={budget.savings.usdCurrent || ''}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="savingsEurGoal" className="text-sm font-medium text-zinc-200">
            Meta ahorro EUR
          </label>
          <input
            id="savingsEurGoal"
            name="savingsEurGoal"
            type="number"
            min="0"
            step="0.01"
            defaultValue={budget.savings.eurGoal || ''}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="savingsEurCurrent" className="text-sm font-medium text-zinc-200">
            Saldo actual EUR
          </label>
          <input
            id="savingsEurCurrent"
            name="savingsEurCurrent"
            type="number"
            min="0"
            step="0.01"
            defaultValue={budget.savings.eurCurrent || ''}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Guardar presupuesto'}
      </button>

      {state.error && (
        <p className="text-sm text-red-500" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-400">Guardado correctamente.</p>
      )}
    </form>
  )
}
