export type DeviationStatus = 'ok' | 'warning' | 'alert'

export type CryptoSavingsBalances = Record<string, number>

export interface SavingsJars {
  arsGoal: number
  arsCurrent: number
  usdGoal: number
  usdCurrent: number
  eurGoal: number
  eurCurrent: number
  crypto: CryptoSavingsBalances
}

export interface BudgetState {
  monthlyBudget: number
  dailyBudget: number
  totalSpent: number
  monthRemaining: number
  spendableRemaining: number
  incomeTotal: number
  savingsContributionsArs: number
  savingsContributionsUsd: number
  savingsContributionsEur: number
  savingsContributionsCrypto: CryptoSavingsBalances
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
  savingsContributionsArs: number
  savingsContributionsUsd: number
  savingsContributionsEur: number
  savingsContributionsCrypto: CryptoSavingsBalances
  totalSpent: number
  monthRemaining: number
  spendableRemaining: number
  dailyAvailable: number
  deviationStatus: DeviationStatus
}
