'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Settings2, Wallet } from 'lucide-react'
import type { BudgetState } from '@/types/budget'
import type { Movement } from '@/types/movement'
import { APP_NAME } from '@/lib/app-config'
import {
  DEFAULT_WIDGET_METRICS,
  WIDGET_METRICS_STORAGE_KEY,
  WIDGET_METRIC_OPTIONS,
  type WidgetMetricId,
  parseWidgetMetrics,
} from '@/types/widget-display'
import { formatCurrency, formatMovementAmount } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface ResumenWidgetViewProps {
  budget: BudgetState
  movements: Movement[]
}

export function ResumenWidgetView({ budget, movements }: ResumenWidgetViewProps) {
  const [metrics, setMetrics] = useState<WidgetMetricId[]>(DEFAULT_WIDGET_METRICS)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setMetrics(parseWidgetMetrics(window.localStorage.getItem(WIDGET_METRICS_STORAGE_KEY)))
  }, [])

  function saveMetrics(next: WidgetMetricId[]) {
    setMetrics(next)
    window.localStorage.setItem(WIDGET_METRICS_STORAGE_KEY, JSON.stringify(next))
  }

  function toggleMetric(id: WidgetMetricId) {
    if (metrics.includes(id)) {
      if (metrics.length === 1) return
      saveMetrics(metrics.filter((m) => m !== id))
      return
    }
    saveMetrics([...metrics, id])
  }

  const totalSpent = budget.fixedPaidTotal + budget.variableExpensesTotal

  return (
    <Link href="/" className="block min-h-dvh bg-zinc-950 px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Wallet size={16} className="text-emerald-400" />
            </div>
            <span className="font-semibold text-zinc-100">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setShowSettings((v) => !v)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              aria-label="Personalizar vista"
            >
              <Settings2 size={18} />
            </button>
            <ChevronRight size={18} className="text-zinc-600" />
          </div>
        </div>

        {showSettings && (
          <div
            className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
            onClick={(e) => e.preventDefault()}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Qué mostrar
            </p>
            <div className="space-y-2">
              {WIDGET_METRIC_OPTIONS.map(({ id, label, hint }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 px-3 py-2.5 has-[:checked]:border-emerald-500/40 has-[:checked]:bg-emerald-500/5"
                >
                  <input
                    type="checkbox"
                    checked={metrics.includes(id)}
                    onChange={() => toggleMetric(id)}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <span>
                    <span className="block text-sm text-zinc-200">{label}</span>
                    {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-600">Se guarda en este dispositivo.</p>
          </div>
        )}

        <p className="mb-4 text-xs text-zinc-500">Tocá fuera del engranaje para abrir la app</p>

        <div className="space-y-3">
          {metrics.includes('dailyBudget') && (
            <MetricCard label="Disponible hoy" value={formatCurrency(budget.dailyBudget)} large />
          )}

          {metrics.includes('spendableRemaining') && (
            <MetricCard
              label="Restante gastable"
              value={formatCurrency(budget.spendableRemaining)}
              large
              accent="emerald"
            />
          )}

          {metrics.includes('totalSpent') && (
            <MetricCard label="Gastos del mes" value={formatCurrency(totalSpent)} accent="red" />
          )}

          {metrics.includes('monthRemaining') && (
            <MetricCard label="Restante del mes" value={formatCurrency(budget.monthRemaining)} />
          )}

          {(metrics.includes('savingsUsd') ||
            metrics.includes('savingsArs') ||
            metrics.includes('savingsEur')) && (
            <div className="grid grid-cols-2 gap-3">
              {metrics.includes('savingsUsd') && (
                <MetricCard
                  label="Ahorro USD"
                  value={formatCurrency(budget.savings.usdCurrent, 'USD')}
                  compact
                  highlight
                />
              )}
              {metrics.includes('savingsArs') && (
                <MetricCard
                  label="Ahorro ARS"
                  value={formatCurrency(budget.savings.arsCurrent)}
                  compact
                />
              )}
              {metrics.includes('savingsEur') && (
                <MetricCard
                  label="Ahorro EUR"
                  value={formatCurrency(budget.savings.eurCurrent, 'EUR')}
                  compact
                />
              )}
            </div>
          )}

          {metrics.includes('recentMovements') && movements.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                Últimos movimientos
              </p>
              <div className="space-y-2">
                {movements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-zinc-300">{m.description}</span>
                    <span className={m.type === 'income' ? 'text-emerald-400' : 'text-zinc-100'}>
                      {m.type === 'income' ? '+' : '-'}
                      {formatMovementAmount(
                        m.amount,
                        m.currency,
                        m.cryptoSymbol,
                        m.savingsTarget,
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function MetricCard({
  label,
  value,
  large,
  compact,
  accent,
  highlight,
}: {
  label: string
  value: string
  large?: boolean
  compact?: boolean
  accent?: 'emerald' | 'red'
  highlight?: boolean
}) {
  const valueClass = cn(
    'font-bold tabular-nums',
    large ? 'text-3xl text-zinc-50' : compact ? 'text-lg text-zinc-100' : 'text-xl text-zinc-100',
    accent === 'emerald' && 'text-emerald-400',
    accent === 'red' && 'text-red-400',
    highlight && 'text-sky-400',
  )

  return (
    <div
      className={cn(
        'rounded-2xl border bg-zinc-900 p-4',
        highlight ? 'border-sky-500/30' : 'border-zinc-800',
        compact && 'rounded-xl p-3',
      )}
    >
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={cn('mt-1', valueClass)}>{value}</p>
    </div>
  )
}
