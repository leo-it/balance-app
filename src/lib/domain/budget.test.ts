import { describe, expect, it } from 'vitest'
import {
  applySavingsContribution,
  computeCryptoSavingsBalanceFromMovements,
  computeMonthlySummary,
  getMonthContext,
  resolveCryptoSavingsBalances,
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
    status: 'paid',
    paidAt: '2026-05-10T10:00:00Z',
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

  it('no suma ingresos al ahorro ni otras monedas al presupuesto en pesos', () => {
    const summary = computeMonthlySummary({
      monthlyBudget: 100_000,
      fixedExpenses: [],
      movements: [
        movement({ amount: 3_000_000, type: 'income', currency: 'ARS', savingsTarget: 'none' }),
        movement({ amount: 500, type: 'income', currency: 'USD', savingsTarget: 'usd' }),
        movement({ amount: 50_000, type: 'income', currency: 'ARS', savingsTarget: 'ars' }),
        movement({ amount: 200, type: 'income', currency: 'EUR', savingsTarget: 'eur' }),
        movement({
          amount: 0.25,
          type: 'income',
          currency: 'CRYPTO',
          cryptoSymbol: 'BTC',
          savingsTarget: 'crypto',
        }),
      ],
      now: NOW,
    })

    expect(summary.incomeTotal).toBe(3_000_000)
    expect(summary.savingsContributionsArs).toBe(50_000)
    expect(summary.savingsContributionsUsd).toBe(500)
    expect(summary.savingsContributionsEur).toBe(200)
    expect(summary.savingsContributionsCrypto.BTC).toBe(0.25)
    expect(summary.monthRemaining).toBe(100_000 + 3_000_000)
  })

  it('calcula disponible hoy descontando fijos pendientes', () => {
    const ctx = getMonthContext(NOW)
    const summary = computeMonthlySummary({
      monthlyBudget: 100_000,
      fixedExpenses: [fixed({ amount: 10_000, status: 'pending' })],
      movements: [],
      now: NOW,
    })

    expect(summary.monthRemaining).toBe(100_000)
    expect(summary.spendableRemaining).toBe(90_000)
    expect(summary.dailyAvailable).toBe(90_000 / ctx.daysRemaining)
  })

  it('no cuenta movimientos pendientes en gastos ni ingresos', () => {
    const summary = computeMonthlySummary({
      monthlyBudget: 100_000,
      fixedExpenses: [],
      movements: [
        movement({ amount: 5_000, type: 'expense', status: 'pending' }),
        movement({ amount: 20_000, type: 'income', status: 'pending' }),
      ],
      now: NOW,
    })

    expect(summary.variableExpensesTotal).toBe(0)
    expect(summary.incomeTotal).toBe(0)
    expect(summary.totalSpent).toBe(0)
    expect(summary.monthRemaining).toBe(100_000)
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
  const jars = {
    arsGoal: 100,
    arsCurrent: 10,
    usdGoal: 50,
    usdCurrent: 5,
    eurGoal: 80,
    eurCurrent: 8,
    crypto: { BTC: 1 },
  }

  it('aporta solo al ahorro ARS', () => {
    const next = applySavingsContribution(jars, 20, 'ars')
    expect(next.arsCurrent).toBe(30)
    expect(next.usdCurrent).toBe(5)
  })

  it('aporta solo al ahorro USD', () => {
    const next = applySavingsContribution(jars, 15, 'usd')
    expect(next.usdCurrent).toBe(20)
    expect(next.arsCurrent).toBe(10)
  })

  it('aporta solo al ahorro EUR', () => {
    const next = applySavingsContribution(jars, 12, 'eur')
    expect(next.eurCurrent).toBe(20)
  })

  it('aporta solo al ahorro cripto indicado', () => {
    const next = applySavingsContribution(jars, 0.5, 'crypto', 'btc')
    expect(next.crypto.BTC).toBe(1.5)
  })
})

describe('crypto savings balances', () => {
  it('calcula saldo acumulado desde ingresos con ahorro cripto', () => {
    const balance = computeCryptoSavingsBalanceFromMovements([
      movement({ amount: 0.0001, type: 'income', savingsTarget: 'crypto', cryptoSymbol: 'BTC' }),
      movement({ amount: 0.5, type: 'income', savingsTarget: 'crypto', cryptoSymbol: 'BTC' }),
    ])
    expect(balance.BTC).toBeCloseTo(0.5001)
  })

  it('usa movimientos si budget_state no tiene saldo cripto guardado', () => {
    const resolved = resolveCryptoSavingsBalances(
      {},
      [movement({ amount: 0.25, type: 'income', savingsTarget: 'crypto', cryptoSymbol: 'ETH' })],
    )
    expect(resolved.ETH).toBe(0.25)
  })
})
