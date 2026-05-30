import { createDbClient } from './client'
import { isMissingTableError } from './health'
import {
  computeMonthlySummary,
  type MonthlySummary as DomainMonthlySummary,
} from '@/lib/domain/budget'
import type { BudgetState, DeviationStatus, SavingsJars } from '@/types/budget'
import type { FixedExpense, ExpenseStatus } from '@/types/expense'
import type { Movement, MovementCurrency, MovementType, SavingsTarget } from '@/types/movement'

interface BudgetRow {
  id: string
  user_id: string
  daily_budget: number
  monthly_budget: number
  total_spent: number
  savings_goal: number
  current_savings: number
  savings_ars_goal?: number
  savings_ars_current?: number
  savings_usd_goal?: number
  savings_usd_current?: number
  deviation_status: DeviationStatus
}

interface ExpenseRow {
  id: string
  user_id: string
  label: string
  amount: number
  icon_name: string
  status: ExpenseStatus
  paid_at: string | null
}

interface MovementRow {
  id: string
  user_id: string
  description: string
  amount: number
  type: MovementType
  category: string
  icon_name: string
  currency?: MovementCurrency
  savings_target?: SavingsTarget
  created_at: string
}

function rowToSavingsJars(row: BudgetRow): SavingsJars {
  return {
    arsGoal: Number(row.savings_ars_goal ?? row.savings_goal ?? 0),
    arsCurrent: Number(row.savings_ars_current ?? row.current_savings ?? 0),
    usdGoal: Number(row.savings_usd_goal ?? 0),
    usdCurrent: Number(row.savings_usd_current ?? 0),
  }
}

function toFixedExpense(row: ExpenseRow): FixedExpense {
  return {
    id: row.id,
    label: row.label,
    amount: Number(row.amount),
    iconName: row.icon_name,
    status: row.status,
    ...(row.paid_at ? { paidAt: row.paid_at } : {}),
  }
}

function toMovement(row: MovementRow): Movement {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    iconName: row.icon_name,
    currency: row.currency ?? 'ARS',
    savingsTarget: row.savings_target ?? 'none',
    createdAt: row.created_at,
  }
}

async function fetchBudgetRow(userId: string): Promise<BudgetRow | null> {
  const db = createDbClient()
  const { data, error } = await db
    .from('budget_state')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (isMissingTableError(error.message)) return null
    throw new Error(error.message)
  }
  return data as BudgetRow | null
}

export async function getFixedExpenses(userId: string): Promise<FixedExpense[]> {
  const db = createDbClient()
  const { data, error } = await db
    .from('fixed_expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []
  return (data as ExpenseRow[]).map(toFixedExpense)
}

export async function getAllMovements(userId: string): Promise<Movement[]> {
  const db = createDbClient()
  const { data, error } = await db
    .from('movements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data) return []
  return (data as MovementRow[]).map(toMovement)
}

export async function getRecentMovements(userId: string, limit = 20): Promise<Movement[]> {
  const movements = await getAllMovements(userId)
  return movements.slice(0, limit)
}

export async function getMonthlySummary(userId: string): Promise<DomainMonthlySummary | null> {
  const row = await fetchBudgetRow(userId)
  if (!row) return null

  const [fixedExpenses, movements] = await Promise.all([
    getFixedExpenses(userId),
    getAllMovements(userId),
  ])

  return computeMonthlySummary({
    monthlyBudget: Number(row.monthly_budget),
    fixedExpenses,
    movements,
  })
}

export async function getSavingsJars(userId: string): Promise<SavingsJars | null> {
  const row = await fetchBudgetRow(userId)
  if (!row) return null
  return rowToSavingsJars(row)
}

export async function getBudgetState(userId: string): Promise<BudgetState | null> {
  const row = await fetchBudgetRow(userId)
  if (!row) return null

  const summary = await getMonthlySummary(userId)
  if (!summary) return null

  return {
    monthlyBudget: summary.monthlyBudget,
    dailyBudget: summary.dailyAvailable,
    totalSpent: summary.totalSpent,
    monthRemaining: summary.monthRemaining,
    incomeTotal: summary.incomeTotal,
    fixedPaidTotal: summary.fixedPaidTotal,
    fixedPendingTotal: summary.fixedPendingTotal,
    variableExpensesTotal: summary.variableExpensesTotal,
    deviationStatus: summary.deviationStatus,
    savings: rowToSavingsJars(row),
  }
}

export async function syncBudgetSnapshot(userId: string): Promise<void> {
  const row = await fetchBudgetRow(userId)
  if (!row) return

  const summary = await getMonthlySummary(userId)
  if (!summary) return

  const db = createDbClient()
  const { error } = await db
    .from('budget_state')
    .update({
      daily_budget: summary.dailyAvailable,
      total_spent: summary.totalSpent,
      deviation_status: summary.deviationStatus,
    })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function getAllExpenseMovements(userId: string): Promise<Movement[]> {
  const movements = await getAllMovements(userId)
  return movements.filter((m) => m.type === 'expense')
}

export interface CategorySpend {
  label: string
  amount: number
  percent: number
}

export async function getSpendingByCategory(userId: string): Promise<CategorySpend[]> {
  const movements = await getAllExpenseMovements(userId)
  const totals = new Map<string, number>()

  for (const m of movements) {
    totals.set(m.category, (totals.get(m.category) ?? 0) + m.amount)
  }

  const total = [...totals.values()].reduce((a, b) => a + b, 0)
  if (total === 0) return []

  return [...totals.entries()]
    .map(([label, amount]) => ({
      label,
      amount,
      percent: Math.round((amount / total) * 100),
    }))
    .sort((a, b) => b.amount - a.amount)
}

export interface MonthlySpend {
  month: string
  amount: number
}

export async function getMonthlyExpenseTotals(userId: string, months = 6): Promise<MonthlySpend[]> {
  const movements = await getAllExpenseMovements(userId)
  const byMonth = new Map<string, number>()

  for (const m of movements) {
    const date = new Date(m.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    byMonth.set(key, (byMonth.get(key) ?? 0) + m.amount)
  }

  const sorted = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b))
  const recent = sorted.slice(-months)

  return recent.map(([key, amount]) => {
    const [, monthNum] = key.split('-')
    const monthLabel = new Intl.DateTimeFormat('es-AR', { month: 'short' })
      .format(new Date(2000, Number(monthNum) - 1, 1))
    return { month: monthLabel.replace('.', ''), amount }
  })
}

export interface FixedVsVariable {
  fixedPaid: number
  variable: number
}

export async function getFixedVsVariable(userId: string): Promise<FixedVsVariable> {
  const summary = await getMonthlySummary(userId)
  return {
    fixedPaid: summary?.fixedPaidTotal ?? 0,
    variable: summary?.variableExpensesTotal ?? 0,
  }
}

export interface IncomeExpenseBalance {
  income: number
  expense: number
}

export async function getIncomeExpenseBalance(userId: string): Promise<IncomeExpenseBalance> {
  const summary = await getMonthlySummary(userId)
  return {
    income: summary?.incomeTotal ?? 0,
    expense: (summary?.variableExpensesTotal ?? 0) + (summary?.fixedPaidTotal ?? 0),
  }
}

export interface SavingsContributionMonth {
  month: string
  ars: number
  usd: number
}

export async function getSavingsContributionsByMonth(
  userId: string,
  months = 6,
): Promise<SavingsContributionMonth[]> {
  const movements = await getAllMovements(userId)
  const byMonth = new Map<string, { ars: number; usd: number }>()

  for (const m of movements) {
    if (m.savingsTarget === 'none') continue
    const date = new Date(m.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const entry = byMonth.get(key) ?? { ars: 0, usd: 0 }
    if (m.savingsTarget === 'ars') entry.ars += m.amount
    if (m.savingsTarget === 'usd') entry.usd += m.amount
    byMonth.set(key, entry)
  }

  const sorted = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b))
  return sorted.slice(-months).map(([key, { ars, usd }]) => {
    const [, monthNum] = key.split('-')
    const monthLabel = new Intl.DateTimeFormat('es-AR', { month: 'short' })
      .format(new Date(2000, Number(monthNum) - 1, 1))
    return { month: monthLabel.replace('.', ''), ars, usd }
  })
}

export async function initUserData(userId: string): Promise<void> {
  const db = createDbClient()

  const { error } = await db.from('budget_state').upsert(
    {
      user_id: userId,
      daily_budget: 0,
      monthly_budget: 0,
      total_spent: 0,
      savings_goal: 0,
      current_savings: 0,
      savings_ars_goal: 0,
      savings_ars_current: 0,
      savings_usd_goal: 0,
      savings_usd_current: 0,
      deviation_status: 'ok',
    },
    { onConflict: 'user_id' },
  )

  if (error) throw new Error(error.message)
}

export async function updateBudgetConfig(
  userId: string,
  patch: {
    monthlyBudget?: number
    savingsArsGoal?: number
    savingsArsCurrent?: number
    savingsUsdGoal?: number
    savingsUsdCurrent?: number
  },
): Promise<void> {
  const db = createDbClient()
  const row: Record<string, number> = {}

  if (patch.monthlyBudget !== undefined) row.monthly_budget = patch.monthlyBudget
  if (patch.savingsArsGoal !== undefined) {
    row.savings_ars_goal = patch.savingsArsGoal
    row.savings_goal = patch.savingsArsGoal
  }
  if (patch.savingsArsCurrent !== undefined) {
    row.savings_ars_current = patch.savingsArsCurrent
    row.current_savings = patch.savingsArsCurrent
  }
  if (patch.savingsUsdGoal !== undefined) row.savings_usd_goal = patch.savingsUsdGoal
  if (patch.savingsUsdCurrent !== undefined) row.savings_usd_current = patch.savingsUsdCurrent

  const { error } = await db.from('budget_state').update(row).eq('user_id', userId)
  if (error) throw new Error(error.message)

  await syncBudgetSnapshot(userId)
}

export async function applySavingsFromMovement(
  userId: string,
  amount: number,
  target: SavingsTarget,
): Promise<void> {
  if (target === 'none') return

  const jars = await getSavingsJars(userId)
  if (!jars) return

  const patch =
    target === 'ars'
      ? { savingsArsCurrent: jars.arsCurrent + amount }
      : { savingsUsdCurrent: jars.usdCurrent + amount }

  await updateBudgetConfig(userId, patch)
}

export async function reverseSavingsFromMovement(
  userId: string,
  amount: number,
  target: SavingsTarget,
): Promise<void> {
  if (target === 'none') return

  const jars = await getSavingsJars(userId)
  if (!jars) return

  const patch =
    target === 'ars'
      ? { savingsArsCurrent: Math.max(0, jars.arsCurrent - amount) }
      : { savingsUsdCurrent: Math.max(0, jars.usdCurrent - amount) }

  await updateBudgetConfig(userId, patch)
}
