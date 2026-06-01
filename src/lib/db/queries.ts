import { createDbClient } from './client'
import { isMissingColumnError, isMissingTableError } from './health'
import { getRemindersByEntityIds } from './reminders'
import {
  computeMonthlySummary,
  type MonthlySummary as DomainMonthlySummary,
} from '@/lib/domain/budget'
import type { BudgetState, CryptoSavingsBalances, DeviationStatus, SavingsJars } from '@/types/budget'
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
  savings_eur_goal?: number
  savings_eur_current?: number
  savings_crypto?: CryptoSavingsBalances | null
  deviation_status: DeviationStatus
}

function parseCryptoBalances(raw: unknown): CryptoSavingsBalances {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const result: CryptoSavingsBalances = {}
  for (const [key, value] of Object.entries(raw)) {
    const amount = parseDbNumeric(value)
    if (amount > 0) {
      result[key.toUpperCase()] = amount
    }
  }
  return result
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
  amount: number | string
  type: MovementType
  category: string
  icon_name: string
  currency?: MovementCurrency
  crypto_symbol?: string | null
  savings_target?: SavingsTarget
  created_at: string
}

function rowToSavingsJars(row: BudgetRow): SavingsJars {
  return {
    arsGoal: Number(row.savings_ars_goal ?? row.savings_goal ?? 0),
    arsCurrent: Number(row.savings_ars_current ?? row.current_savings ?? 0),
    usdGoal: Number(row.savings_usd_goal ?? 0),
    usdCurrent: Number(row.savings_usd_current ?? 0),
    eurGoal: Number(row.savings_eur_goal ?? 0),
    eurCurrent: Number(row.savings_eur_current ?? 0),
    crypto: parseCryptoBalances(row.savings_crypto),
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

function parseDbNumeric(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string') {
    const parsed = Number(raw.trim().replace(',', '.'))
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

function resolveMovementCurrency(
  currency: MovementCurrency | undefined,
  savingsTarget: SavingsTarget,
  cryptoSymbol?: string,
): MovementCurrency {
  if (currency === 'USD' || currency === 'EUR' || currency === 'CRYPTO') return currency
  if (savingsTarget === 'crypto' || cryptoSymbol) return 'CRYPTO'
  return 'ARS'
}

function toMovement(row: MovementRow): Movement {
  const cryptoSymbol = row.crypto_symbol?.trim() || undefined
  const savingsTarget = row.savings_target ?? 'none'
  const currency = resolveMovementCurrency(row.currency, savingsTarget, cryptoSymbol)
  return {
    id: row.id,
    description: row.description,
    amount: parseDbNumeric(row.amount),
    type: row.type,
    category: row.category,
    iconName: row.icon_name,
    currency,
    savingsTarget,
    ...(cryptoSymbol ? { cryptoSymbol } : {}),
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

  const rows = data as ExpenseRow[]
  const reminderMap = await getRemindersByEntityIds(
    userId,
    'fixed_expense',
    rows.map((row) => row.id),
  )

  return rows.map((row) => ({
    ...toFixedExpense(row),
    reminder: reminderMap.get(row.id) ?? null,
  }))
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

  const rows = data as MovementRow[]
  const reminderMap = await getRemindersByEntityIds(
    userId,
    'movement',
    rows.map((row) => row.id),
  )

  return rows.map((row) => ({
    ...toMovement(row),
    reminder: reminderMap.get(row.id) ?? null,
  }))
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
    spendableRemaining: summary.spendableRemaining,
    incomeTotal: summary.incomeTotal,
    savingsContributionsArs: summary.savingsContributionsArs,
    savingsContributionsUsd: summary.savingsContributionsUsd,
    savingsContributionsEur: summary.savingsContributionsEur,
    savingsContributionsCrypto: summary.savingsContributionsCrypto,
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
  eur: number
  crypto: CryptoSavingsBalances
}

export async function getSavingsContributionsByMonth(
  userId: string,
  months = 6,
): Promise<SavingsContributionMonth[]> {
  const movements = await getAllMovements(userId)
  const byMonth = new Map<string, { ars: number; usd: number; eur: number; crypto: CryptoSavingsBalances }>()

  for (const m of movements) {
    if (m.savingsTarget === 'none') continue
    const date = new Date(m.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const entry = byMonth.get(key) ?? { ars: 0, usd: 0, eur: 0, crypto: {} }
    if (m.savingsTarget === 'ars') entry.ars += m.amount
    if (m.savingsTarget === 'usd') entry.usd += m.amount
    if (m.savingsTarget === 'eur') entry.eur += m.amount
    if (m.savingsTarget === 'crypto') {
      const symbol = (m.cryptoSymbol ?? 'CRIPTO').toUpperCase()
      entry.crypto[symbol] = (entry.crypto[symbol] ?? 0) + m.amount
    }
    byMonth.set(key, entry)
  }

  const sorted = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b))
  return sorted.slice(-months).map(([key, { ars, usd, eur, crypto }]) => {
    const [, monthNum] = key.split('-')
    const monthLabel = new Intl.DateTimeFormat('es-AR', { month: 'short' })
      .format(new Date(2000, Number(monthNum) - 1, 1))
    return { month: monthLabel.replace('.', ''), ars, usd, eur, crypto }
  })
}

export async function initUserData(userId: string): Promise<void> {
  const db = createDbClient()

  const fullRow = {
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
    savings_eur_goal: 0,
    savings_eur_current: 0,
    savings_crypto: {},
    deviation_status: 'ok',
  }

  let { error } = await db.from('budget_state').upsert(fullRow, { onConflict: 'user_id' })

  if (error && isMissingColumnError(error.message)) {
    ;({ error } = await db.from('budget_state').upsert(
      {
        user_id: userId,
        daily_budget: 0,
        monthly_budget: 0,
        total_spent: 0,
        savings_goal: 0,
        current_savings: 0,
        deviation_status: 'ok',
      },
      { onConflict: 'user_id' },
    ))
  }

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
    savingsEurGoal?: number
    savingsEurCurrent?: number
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
  if (patch.savingsEurGoal !== undefined) row.savings_eur_goal = patch.savingsEurGoal
  if (patch.savingsEurCurrent !== undefined) row.savings_eur_current = patch.savingsEurCurrent

  let { error } = await db.from('budget_state').update(row).eq('user_id', userId)

  if (error && isMissingColumnError(error.message)) {
    delete row.savings_ars_goal
    delete row.savings_ars_current
    delete row.savings_usd_goal
    delete row.savings_usd_current
    delete row.savings_eur_goal
    delete row.savings_eur_current
    ;({ error } = await db.from('budget_state').update(row).eq('user_id', userId))
  }

  if (error) throw new Error(error.message)

  await syncBudgetSnapshot(userId)
}

async function updateCryptoSavings(
  userId: string,
  symbol: string,
  delta: number,
): Promise<void> {
  const row = await fetchBudgetRow(userId)
  if (!row) return

  const key = symbol.toUpperCase()
  const balances = parseCryptoBalances(row.savings_crypto)
  const next = Math.max(0, (balances[key] ?? 0) + delta)
  const updated: CryptoSavingsBalances = { ...balances }

  if (next === 0) {
    delete updated[key]
  } else {
    updated[key] = next
  }

  const db = createDbClient()
  const { error } = await db
    .from('budget_state')
    .update({ savings_crypto: updated })
    .eq('user_id', userId)

  if (error && isMissingColumnError(error.message)) return
  if (error) throw new Error(error.message)
}

export async function applySavingsFromMovement(
  userId: string,
  amount: number,
  target: SavingsTarget,
  cryptoSymbol?: string,
): Promise<void> {
  if (target === 'none') return

  if (target === 'crypto') {
    const symbol = cryptoSymbol?.trim()
    if (!symbol) throw new Error('Indicá la criptomoneda para el ahorro')
    await updateCryptoSavings(userId, symbol, amount)
    return
  }

  const jars = await getSavingsJars(userId)
  if (!jars) return

  const patch =
    target === 'ars'
      ? { savingsArsCurrent: jars.arsCurrent + amount }
      : target === 'usd'
        ? { savingsUsdCurrent: jars.usdCurrent + amount }
        : { savingsEurCurrent: jars.eurCurrent + amount }

  await updateBudgetConfig(userId, patch)
}

export async function reverseSavingsFromMovement(
  userId: string,
  amount: number,
  target: SavingsTarget,
  cryptoSymbol?: string,
): Promise<void> {
  if (target === 'none') return

  if (target === 'crypto') {
    const symbol = cryptoSymbol?.trim()
    if (!symbol) return
    await updateCryptoSavings(userId, symbol, -amount)
    return
  }

  const jars = await getSavingsJars(userId)
  if (!jars) return

  const patch =
    target === 'ars'
      ? { savingsArsCurrent: Math.max(0, jars.arsCurrent - amount) }
      : target === 'usd'
        ? { savingsUsdCurrent: Math.max(0, jars.usdCurrent - amount) }
        : { savingsEurCurrent: Math.max(0, jars.eurCurrent - amount) }

  await updateBudgetConfig(userId, patch)
}

export async function fetchMovementRow(
  userId: string,
  movementId: string,
): Promise<MovementRow> {
  const db = createDbClient()
  const { data, error } = await db
    .from('movements')
    .select('*')
    .eq('id', movementId)
    .eq('user_id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data as MovementRow
}

interface MovementWriteInput {
  description: string
  amount: number
  type: MovementType
  category: string
  iconName: string
  currency: MovementCurrency
  cryptoSymbol?: string
  savingsTarget: SavingsTarget
}

function movementRowPayload(input: MovementWriteInput): Record<string, unknown> {
  const symbol = input.cryptoSymbol?.trim().toUpperCase()
  return {
    description: input.description,
    amount: input.amount,
    type: input.type,
    category: input.category,
    icon_name: input.iconName,
    currency: input.currency,
    savings_target: input.savingsTarget,
    crypto_symbol: symbol ?? null,
  }
}

export async function insertMovementRow(
  userId: string,
  input: MovementWriteInput & { createdAt: string },
): Promise<string> {
  const db = createDbClient()
  const fullRow = {
    user_id: userId,
    ...movementRowPayload(input),
    created_at: input.createdAt,
  }

  let result = await db.from('movements').insert(fullRow).select('id').single()

  if (result.error && isMissingColumnError(result.error.message)) {
    result = await db.from('movements').insert({
      user_id: userId,
      description: input.description,
      amount: input.amount,
      type: input.type,
      category: input.category,
      icon_name: input.iconName,
      created_at: input.createdAt,
    }).select('id').single()
  }

  if (result.error) throw new Error(result.error.message)
  if (!result.data?.id) throw new Error('No se pudo crear el movimiento')
  return result.data.id as string
}

export async function updateMovementRow(
  userId: string,
  movementId: string,
  input: MovementWriteInput,
): Promise<void> {
  const db = createDbClient()
  const fullRow = movementRowPayload(input)

  let { error } = await db
    .from('movements')
    .update(fullRow)
    .eq('id', movementId)
    .eq('user_id', userId)

  if (error && isMissingColumnError(error.message)) {
    ;({ error } = await db
      .from('movements')
      .update({
        description: input.description,
        amount: input.amount,
        type: input.type,
        category: input.category,
        icon_name: input.iconName,
      })
      .eq('id', movementId)
      .eq('user_id', userId))
  }

  if (error) throw new Error(error.message)
}
