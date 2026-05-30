import type { BudgetState } from '@/types/budget'
import { formatCurrency } from '@/lib/formatters'

interface MonthlyBreakdownProps {
  budget: BudgetState
}

export function MonthlyBreakdown({ budget }: MonthlyBreakdownProps) {
  const spentTotal = budget.fixedPaidTotal + budget.variableExpensesTotal

  return (
    <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 pt-3">
      <div>
        <p className="text-[10px] uppercase tracking-wide text-zinc-500">Ingresos</p>
        <p className="text-sm font-semibold tabular-nums text-emerald-400">
          +{formatCurrency(budget.incomeTotal)}
        </p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-zinc-500">Gastos</p>
        <p className="text-sm font-semibold tabular-nums text-red-400">
          -{formatCurrency(spentTotal)}
        </p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-zinc-500">Restante</p>
        <p className="text-sm font-semibold tabular-nums text-zinc-100">
          {formatCurrency(budget.monthRemaining)}
        </p>
      </div>
    </div>
  )
}
