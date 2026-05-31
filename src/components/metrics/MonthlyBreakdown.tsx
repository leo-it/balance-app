import type { BudgetState } from '@/types/budget'
import { formatCryptoAmount, formatCurrency } from '@/lib/formatters'

interface MonthlyBreakdownProps {
  budget: BudgetState
}

export function MonthlyBreakdown({ budget }: MonthlyBreakdownProps) {
  const spentTotal = budget.fixedPaidTotal + budget.variableExpensesTotal
  const cryptoEntries = Object.entries(budget.savingsContributionsCrypto)
  const hasSavingsContributions =
    budget.savingsContributionsArs > 0 ||
    budget.savingsContributionsUsd > 0 ||
    budget.savingsContributionsEur > 0 ||
    cryptoEntries.length > 0
  const hasPendingFixed = budget.fixedPendingTotal > 0

  return (
    <div className="space-y-2 border-t border-zinc-800 pt-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Ingresos</p>
          <p className="text-sm font-semibold tabular-nums text-emerald-400">
            +{formatCurrency(budget.incomeTotal)}
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-600">Al presupuesto (ARS)</p>
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
            {formatCurrency(budget.spendableRemaining)}
          </p>
          {hasPendingFixed && (
            <p className="mt-0.5 text-[10px] text-zinc-600">
              Descontando {formatCurrency(budget.fixedPendingTotal)} en fijos pendientes
            </p>
          )}
        </div>
      </div>

      {hasSavingsContributions && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-500">
          <span>Aportes al ahorro este mes (no suman arriba):</span>
          {budget.savingsContributionsArs > 0 && (
            <span className="text-amber-400">
              ARS +{formatCurrency(budget.savingsContributionsArs)}
            </span>
          )}
          {budget.savingsContributionsUsd > 0 && (
            <span className="text-sky-400">
              USD +{formatCurrency(budget.savingsContributionsUsd, 'USD')}
            </span>
          )}
          {budget.savingsContributionsEur > 0 && (
            <span className="text-violet-400">
              EUR +{formatCurrency(budget.savingsContributionsEur, 'EUR')}
            </span>
          )}
          {cryptoEntries.map(([symbol, amount]) => (
            <span key={symbol} className="text-orange-400">
              {formatCryptoAmount(amount, symbol)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
