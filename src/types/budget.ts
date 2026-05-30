export type DeviationStatus = 'ok' | 'warning' | 'alert'

export interface SavingsJars {
  arsGoal: number
  arsCurrent: number
  usdGoal: number
  usdCurrent: number
}

export interface BudgetState {
  monthlyBudget: number
  dailyBudget: number
  totalSpent: number
  monthRemaining: number
  incomeTotal: number
  fixedPaidTotal: number
  fixedPendingTotal: number
  variableExpensesTotal: number
  deviationStatus: DeviationStatus
  savings: SavingsJars
}

export interface MonthlySummary {
  monthlyBudget: number
  fixedPaidTotal: number
  fixedPendingTotal: number
  fixedCommittedTotal: number
  variableExpensesTotal: number
  incomeTotal: number
  totalSpent: number
  monthRemaining: number
  dailyAvailable: number
  deviationStatus: DeviationStatus
}
