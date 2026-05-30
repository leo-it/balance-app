import { describe, expect, it } from 'vitest'
import {
  computeMonthlySummary,
  applySavingsContribution,
  getMonthContext,
} from './budget'
import type { FixedExpense } from '@/types/expense'
import type { Movement } from '@/types/movement'

const NOW = new Date('2026-05-15T12:00:00-03:00')

function fixed(partial: Partial<FixedExpense> & Pick<FixedExpense, 'amount' | 'status'>): FixedExpense {
  return {
    id: '1',
    label: 'Test',
    iconName: 'Receipt',
    ...partial,
  }
}

function movement(partial: Partial<Movement> & Pick<Movement, 'amount' | 'type'>): Movement {
  return {
    id: '1',
    description: 'Test',
    category: 'General',
    iconName: 'Receipt',
    currency: 'ARS',
    savingsTarget: 'none',
    createdAt: '2026-05-10T10:00:00Z',
    ...partial,
  }
}

describe('computeMonthlySummary', () => {
  it('resta fijos pagados y gastos variables, suma ingresos', () => {
    const summary = computeMonthlySummary({
      monthlyBudget: 100_000,
      fixedExpenses: [
        fixed({ amount: 30_000, status: 'paid', paidAt: '2026-05-01T10:00:00Z' }),
        fixed({ amount: 10_000, status: 'pending' }),
      ],
      movements: [
        movement({ amount: 5_000, type: 'expense' }),
        movement({ amount: 20_000, type: 'income' }),
      ],
      now: NOW,
    })

    expect(summary.fixedPaidTotal).toBe(30_000)
    expect(summary.fixedPendingTotal).toBe(10_000)
    expect(summary.variableExpensesTotal).toBe(5_000)
    expect(summary.incomeTotal).toBe(20_000)
    expect(summary.totalSpent).toBe(35_000)
    expect(summary.monthRemaining).toBe(100_000 - 30_000 - 5_000 + 20_000)
  })

  it('calcula disponible hoy dividiendo restante entre días restantes', () => {
    const ctx = getMonthContext(NOW)
    const summary = computeMonthlySummary({
      monthlyBudget: 100_000,
      fixedExpenses: [],
      movements: [],
      now: NOW,
    })

    expect(summary.dailyAvailable).toBe(100_000 / ctx.daysRemaining)
  })

  it('no cuenta fijos pagados en otro mes', () => {
    const summary = computeMonthlySummary({
      monthlyBudget: 50_000,
      fixedExpenses: [
        fixed({ amount: 20_000, status: 'paid', paidAt: '2026-04-01T10:00:00Z' }),
      ],
      movements: [],
      now: NOW,
    })

    expect(summary.fixedPaidTotal).toBe(0)
    expect(summary.monthRemaining).toBe(50_000)
  })
})

describe('applySavingsContribution', () => {
  const jars = { arsGoal: 100, arsCurrent: 10, usdGoal: 50, usdCurrent: 5 }

  it('aporta solo al jar ARS', () => {
    const next = applySavingsContribution(jars, 20, 'ars')
    expect(next.arsCurrent).toBe(30)
    expect(next.usdCurrent).toBe(5)
  })

  it('aporta solo al jar USD', () => {
    const next = applySavingsContribution(jars, 15, 'usd')
    expect(next.usdCurrent).toBe(20)
    expect(next.arsCurrent).toBe(10)
  })
})
