import { assertDatabase } from '@/lib/env'
import type { BudgetState } from '@/types/budget'
import type { FixedExpense } from '@/types/expense'
import type { Movement } from '@/types/movement'

export { hasValidDatabase } from '@/lib/env'

export type DashboardLoadState =
  | { status: 'ok'; budget: BudgetState; expenses: FixedExpense[]; movements: Movement[] }
  | { status: 'missing_tables' }
  | { status: 'unreachable' }

export async function getDashboardData(userId: string): Promise<DashboardLoadState> {
  assertDatabase()

  const { isDatabaseReady, isDatabaseReachable, getBudgetState, getFixedExpenses, getRecentMovements, initUserData } =
    await import('@/lib/db')

  if (!(await isDatabaseReachable())) {
    return { status: 'unreachable' }
  }

  if (!(await isDatabaseReady())) return { status: 'missing_tables' }

  let budget = await getBudgetState(userId)

  if (!budget) {
    await initUserData(userId)
    budget = await getBudgetState(userId)
  }

  if (!budget) {
    throw new Error(
      'No se pudo crear el presupuesto. Verificá que SUPABASE_SERVICE_ROLE_KEY sea la key service_role en .env.local',
    )
  }

  const [expenses, movements] = await Promise.all([
    getFixedExpenses(userId),
    getRecentMovements(userId),
  ])

  return {
    status: 'ok',
    budget,
    expenses,
    movements,
  }
}

export async function getBudgetForUser(userId: string): Promise<BudgetState | null> {
  assertDatabase()
  const { isDatabaseReady, getBudgetState, initUserData } = await import('@/lib/db')
  if (!(await isDatabaseReady())) return null
  let budget = await getBudgetState(userId)
  if (!budget) {
    await initUserData(userId)
    budget = await getBudgetState(userId)
  }
  if (!budget) throw new Error('No se pudo cargar el presupuesto')
  return budget
}
