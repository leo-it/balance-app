export { createDbClient } from './client'
export { createServerDbClient } from './server'
export { createBrowserDbClient } from './browser'
export { isDatabaseReady, isMissingTableError } from './health'
export {
  getBudgetState,
  getFixedExpenses,
  getRecentMovements,
  getAllMovements,
  getAllExpenseMovements,
  getSpendingByCategory,
  getMonthlyExpenseTotals,
  getMonthlySummary,
  getSavingsJars,
  getFixedVsVariable,
  getIncomeExpenseBalance,
  getSavingsContributionsByMonth,
  initUserData,
  syncBudgetSnapshot,
  updateBudgetConfig,
  applySavingsFromMovement,
} from './queries'
export type {
  CategorySpend,
  MonthlySpend,
  FixedVsVariable,
  IncomeExpenseBalance,
  SavingsContributionMonth,
} from './queries'
