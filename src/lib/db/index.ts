export { createDbClient } from './client'
export { createServerDbClient } from './server'
export { createBrowserDbClient } from './browser'
export { isDatabaseReady, isDatabaseReachable, isDualCurrencySchemaReady, isRemindersSchemaReady, isMissingColumnError, isMissingTableError, isConnectionError } from './health'
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
  reverseSavingsFromMovement,
  fetchMovementRow,
  insertMovementRow,
  updateMovementRow,
} from './queries'
export {
  deleteReminderForEntity,
  getScheduledReminders,
  syncReminderForEntity,
} from './reminders'
export type {
  CategorySpend,
  MonthlySpend,
  FixedVsVariable,
  IncomeExpenseBalance,
  SavingsContributionMonth,
} from './queries'
