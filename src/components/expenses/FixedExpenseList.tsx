'use client'

import { useOptimistic, useTransition } from 'react'
import { markAsPaid, undoPaid } from '@/actions/expense.actions'
import { formatCurrency } from '@/lib/formatters'
import type { FixedExpense } from '@/types/expense'
import { FixedExpenseCard } from './FixedExpenseCard'

interface FixedExpenseListProps {
  expenses: FixedExpense[]
}

export function FixedExpenseList({ expenses }: FixedExpenseListProps) {
  const [, startTransition] = useTransition()

  const [optimisticExpenses, applyOptimistic] = useOptimistic(
    expenses,
    (state: FixedExpense[], update: { id: string; status: 'pending' | 'paid' }) =>
      state.map((e) =>
        e.id === update.id
          ? { ...e, status: update.status, paidAt: update.status === 'paid' ? new Date().toISOString() : undefined }
          : e,
      ),
  )

  function handlePay(id: string) {
    startTransition(async () => {
      applyOptimistic({ id, status: 'paid' })
      await markAsPaid(id)
    })
  }

  function handleUndo(id: string) {
    startTransition(async () => {
      applyOptimistic({ id, status: 'pending' })
      await undoPaid(id)
    })
  }

  const pending = optimisticExpenses.filter((e) => e.status === 'pending')
  const paid = optimisticExpenses.filter((e) => e.status === 'paid')

  if (optimisticExpenses.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Gastos fijos del mes
        </h2>
        <p className="rounded-xl border border-dashed border-zinc-800 py-8 text-center text-sm text-zinc-500">
          No hay gastos fijos. Usá el botón + para agregar uno.
        </p>
      </section>
    )
  }

  const pendingTotal = pending.reduce((s, e) => s + e.amount, 0)
  const paidTotal = paid.reduce((s, e) => s + e.amount, 0)

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Gastos fijos del mes
        </h2>
        <p className="mt-1 text-xs text-zinc-600">
          Compromisos mensuales. Solo restan del presupuesto al marcarlos como pagados.
        </p>
      </div>

      <div className="flex gap-3 text-xs">
        <span className="text-amber-400">Pendiente: {formatCurrency(pendingTotal)}</span>
        <span className="text-emerald-400">Pagado: {formatCurrency(paidTotal)}</span>
      </div>

      <div className="space-y-2">
        {pending.map((expense) => (
          <FixedExpenseCard
            key={expense.id}
            expense={expense}
            onPay={handlePay}
            onUndo={handleUndo}
          />
        ))}
      </div>

      {paid.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-600">Pagados</p>
          {paid.map((expense) => (
            <FixedExpenseCard
              key={expense.id}
              expense={expense}
              onPay={handlePay}
              onUndo={handleUndo}
            />
          ))}
        </div>
      )}
    </section>
  )
}
