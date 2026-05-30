import type { DeviationStatus } from '@/types/budget'
import type { FixedExpense } from '@/types/expense'
import type { Movement } from '@/types/movement'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

export interface MonthContext {
  year: number
  month: number
  dayOfMonth: number
  daysInMonth: number
  daysRemaining: number
}

export interface MonthlySummaryInput {
  monthlyBudget: number
  fixedExpenses: FixedExpense[]
  movements: Movement[]
  now?: Date
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

export interface SavingsJars {
  arsGoal: number
  arsCurrent: number
  usdGoal: number
  usdCurrent: number
}

export function getMonthContext(now: Date = new Date()): MonthContext {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const year = Number(parts.find((p) => p.type === 'year')?.value ?? 0)
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? 0)
  const dayOfMonth = Number(parts.find((p) => p.type === 'day')?.value ?? 0)
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth + 1)

  return { year, month, dayOfMonth, daysInMonth, daysRemaining }
}

export function isInMonth(isoDate: string, ctx: MonthContext): boolean {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date(isoDate))

  const year = Number(parts.find((p) => p.type === 'year')?.value ?? 0)
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? 0)
  return year === ctx.year && month === ctx.month
}

export function sumFixedPaidThisMonth(fixedExpenses: FixedExpense[], ctx: MonthContext): number {
  return fixedExpenses
    .filter((e) => e.status === 'paid' && e.paidAt && isInMonth(e.paidAt, ctx))
    .reduce((sum, e) => sum + e.amount, 0)
}

export function sumFixedPending(fixedExpenses: FixedExpense[]): number {
  return fixedExpenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0)
}

export function sumMovementsByType(
  movements: Movement[],
  type: 'income' | 'expense',
  ctx: MonthContext,
): number {
  return movements
    .filter((m) => m.type === type && isInMonth(m.createdAt, ctx))
    .reduce((sum, m) => sum + m.amount, 0)
}

export function computeDeviationStatus(
  monthlyBudget: number,
  totalSpent: number,
  ctx: MonthContext,
): DeviationStatus {
  if (monthlyBudget <= 0) return 'ok'

  const expectedSpent = (monthlyBudget / ctx.daysInMonth) * ctx.dayOfMonth
  const ratio = totalSpent / Math.max(expectedSpent, 1)

  if (ratio > 1.15) return 'alert'
  if (ratio > 1.05) return 'warning'
  return 'ok'
}

export function computeMonthlySummary(input: MonthlySummaryInput): MonthlySummary {
  const ctx = getMonthContext(input.now)
  const fixedPaidTotal = sumFixedPaidThisMonth(input.fixedExpenses, ctx)
  const fixedPendingTotal = sumFixedPending(input.fixedExpenses)
  const variableExpensesTotal = sumMovementsByType(input.movements, 'expense', ctx)
  const incomeTotal = sumMovementsByType(input.movements, 'income', ctx)
  const totalSpent = fixedPaidTotal + variableExpensesTotal
  const monthRemaining =
    input.monthlyBudget - fixedPaidTotal - variableExpensesTotal + incomeTotal
  const dailyAvailable = Math.max(0, monthRemaining) / ctx.daysRemaining
  const deviationStatus = computeDeviationStatus(input.monthlyBudget, totalSpent, ctx)

  return {
    monthlyBudget: input.monthlyBudget,
    fixedPaidTotal,
    fixedPendingTotal,
    fixedCommittedTotal: fixedPaidTotal + fixedPendingTotal,
    variableExpensesTotal,
    incomeTotal,
    totalSpent,
    monthRemaining,
    dailyAvailable,
    deviationStatus,
  }
}

export function applySavingsContribution(
  jars: SavingsJars,
  amount: number,
  target: 'none' | 'ars' | 'usd',
): SavingsJars {
  if (target === 'ars') {
    return { ...jars, arsCurrent: jars.arsCurrent + amount }
  }
  if (target === 'usd') {
    return { ...jars, usdCurrent: jars.usdCurrent + amount }
  }
  return jars
}
