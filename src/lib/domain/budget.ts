import type { DeviationStatus, SavingsJars } from '@/types/budget'
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
  savingsContributionsArs: number
  savingsContributionsUsd: number
  savingsContributionsEur: number
  savingsContributionsCrypto: Record<string, number>
  totalSpent: number
  monthRemaining: number
  spendableRemaining: number
  dailyAvailable: number
  deviationStatus: DeviationStatus
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
    .filter(
      (m) =>
        m.type === type &&
        m.status === 'paid' &&
        m.paidAt &&
        isInMonth(m.paidAt, ctx),
    )
    .reduce((sum, m) => sum + m.amount, 0)
}

export function sumBudgetIncome(movements: Movement[], ctx: MonthContext): number {
  return movements
    .filter(
      (m) =>
        m.type === 'income' &&
        m.status === 'paid' &&
        m.paidAt &&
        isInMonth(m.paidAt, ctx) &&
        m.savingsTarget === 'none' &&
        m.currency === 'ARS',
    )
    .reduce((sum, m) => sum + m.amount, 0)
}

export function sumBudgetVariableExpenses(movements: Movement[], ctx: MonthContext): number {
  return movements
    .filter(
      (m) =>
        m.type === 'expense' &&
        m.status === 'paid' &&
        m.paidAt &&
        isInMonth(m.paidAt, ctx) &&
        m.currency === 'ARS',
    )
    .reduce((sum, m) => sum + m.amount, 0)
}

export function sumMovementsPending(movements: Movement[]): number {
  return movements
    .filter((m) => m.type === 'expense' && m.status === 'pending' && m.currency === 'ARS')
    .reduce((sum, m) => sum + m.amount, 0)
}

export function sumSavingsContributionsThisMonth(
  movements: Movement[],
  ctx: MonthContext,
): { ars: number; usd: number; eur: number; crypto: Record<string, number> } {
  let ars = 0
  let usd = 0
  let eur = 0
  const crypto: Record<string, number> = {}

  for (const m of movements) {
    if (m.type !== 'income' || m.status !== 'paid' || !m.paidAt || !isInMonth(m.paidAt, ctx)) {
      continue
    }
    if (m.savingsTarget === 'ars') ars += m.amount
    if (m.savingsTarget === 'usd') usd += m.amount
    if (m.savingsTarget === 'eur') eur += m.amount
    if (m.savingsTarget === 'crypto') {
      const symbol = (m.cryptoSymbol ?? 'CRIPTO').toUpperCase()
      crypto[symbol] = (crypto[symbol] ?? 0) + m.amount
    }
  }

  return { ars, usd, eur, crypto }
}

export function computeCryptoSavingsBalanceFromMovements(
  movements: Movement[],
): Record<string, number> {
  const crypto: Record<string, number> = {}

  for (const m of movements) {
    if (m.type !== 'income' || m.status !== 'paid' || m.savingsTarget !== 'crypto') continue
    const symbol = (m.cryptoSymbol ?? 'CRIPTO').toUpperCase()
    crypto[symbol] = (crypto[symbol] ?? 0) + m.amount
  }

  return crypto
}

export function resolveCryptoSavingsBalances(
  stored: Record<string, number>,
  movements: Movement[],
): Record<string, number> {
  const hasStoredBalance = Object.values(stored).some((amount) => amount > 0)
  if (hasStoredBalance) return stored
  return computeCryptoSavingsBalanceFromMovements(movements)
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
  const variableExpensesTotal = sumBudgetVariableExpenses(input.movements, ctx)
  const movementsPendingTotal = sumMovementsPending(input.movements)
  const incomeTotal = sumBudgetIncome(input.movements, ctx)
  const { ars: savingsContributionsArs, usd: savingsContributionsUsd, eur: savingsContributionsEur, crypto: savingsContributionsCrypto } =
    sumSavingsContributionsThisMonth(input.movements, ctx)
  const totalSpent = fixedPaidTotal + variableExpensesTotal
  const monthRemaining =
    input.monthlyBudget - fixedPaidTotal - variableExpensesTotal + incomeTotal
  const spendableRemaining = monthRemaining - fixedPendingTotal - movementsPendingTotal
  const dailyAvailable = Math.max(0, spendableRemaining) / ctx.daysRemaining
  const deviationStatus = computeDeviationStatus(input.monthlyBudget, totalSpent, ctx)

  return {
    monthlyBudget: input.monthlyBudget,
    fixedPaidTotal,
    fixedPendingTotal,
    fixedCommittedTotal: fixedPaidTotal + fixedPendingTotal,
    variableExpensesTotal,
    incomeTotal,
    savingsContributionsArs,
    savingsContributionsUsd,
    savingsContributionsEur,
    savingsContributionsCrypto,
    totalSpent,
    monthRemaining,
    spendableRemaining,
    dailyAvailable,
    deviationStatus,
  }
}

export function applySavingsContribution(
  jars: SavingsJars,
  amount: number,
  target: 'none' | 'ars' | 'usd' | 'eur' | 'crypto',
  cryptoSymbol?: string,
): SavingsJars {
  if (target === 'ars') {
    return { ...jars, arsCurrent: jars.arsCurrent + amount }
  }
  if (target === 'usd') {
    return { ...jars, usdCurrent: jars.usdCurrent + amount }
  }
  if (target === 'eur') {
    return { ...jars, eurCurrent: jars.eurCurrent + amount }
  }
  if (target === 'crypto') {
    const symbol = (cryptoSymbol ?? 'CRIPTO').toUpperCase()
    return {
      ...jars,
      crypto: {
        ...jars.crypto,
        [symbol]: (jars.crypto[symbol] ?? 0) + amount,
      },
    }
  }
  return jars
}
