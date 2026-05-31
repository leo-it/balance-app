import type { BudgetState } from '@/types/budget'
import { DailyBudgetWidget } from './DailyBudgetWidget'
import { MonthlyBreakdown } from './MonthlyBreakdown'
import { SavingsProgressWidget } from './SavingsProgressWidget'
import { DeviationAlertBadge } from './DeviationAlertBadge'

interface MetricsHeaderProps {
  budget: BudgetState
}

export function MetricsHeader({ budget }: MetricsHeaderProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <DailyBudgetWidget amount={budget.dailyBudget} />
        <DeviationAlertBadge status={budget.deviationStatus} />
      </div>

      <MonthlyBreakdown budget={budget} />

      <div className="border-t border-zinc-800 pt-3 space-y-3">
        <SavingsProgressWidget
          label="Ahorro ARS"
          current={budget.savings.arsCurrent}
          goal={budget.savings.arsGoal}
        />
        {(budget.savings.usdGoal > 0 || budget.savings.usdCurrent > 0) && (
          <SavingsProgressWidget
            label="Ahorro USD"
            current={budget.savings.usdCurrent}
            goal={budget.savings.usdGoal}
            currency="USD"
          />
        )}
        {(budget.savings.eurGoal > 0 || budget.savings.eurCurrent > 0) && (
          <SavingsProgressWidget
            label="Ahorro EUR"
            current={budget.savings.eurCurrent}
            goal={budget.savings.eurGoal}
            currency="EUR"
          />
        )}
      </div>
    </section>
  )
}
