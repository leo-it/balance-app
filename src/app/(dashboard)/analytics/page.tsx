import {
  ShoppingCart, Fuel, Home, Pill, Utensils, Wifi, Receipt,
  TrendingDown, TrendingUp,
} from 'lucide-react'
import { getUserId } from '@/lib/auth'
import { formatCurrency } from '@/lib/formatters'
import {
  getSpendingByCategory,
  getMonthlyExpenseTotals,
  getMonthlySummary,
  getFixedVsVariable,
  getIncomeExpenseBalance,
  getSavingsContributionsByMonth,
} from '@/lib/db'
import { getBudgetForUser } from '@/lib/data'
import { DatabaseSetupRequired } from '@/components/setup/DatabaseSetupRequired'

const CATEGORY_ICONS: Record<string, typeof Receipt> = {
  Comida: ShoppingCart,
  Transporte: Fuel,
  Alquiler: Home,
  Salud: Pill,
  Restaurantes: Utensils,
  Servicios: Wifi,
}

const CATEGORY_COLORS = [
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-rose-500',
  'bg-orange-500',
]

export default async function AnalyticsPage() {
  const userId = await getUserId()
  const budget = await getBudgetForUser(userId)
  if (!budget) return <DatabaseSetupRequired />

  const [categories, monthly, summary, fixedVsVar, balance, savingsContrib] =
    await Promise.all([
      getSpendingByCategory(userId),
      getMonthlyExpenseTotals(userId),
      getMonthlySummary(userId),
      getFixedVsVariable(userId),
      getIncomeExpenseBalance(userId),
      getSavingsContributionsByMonth(userId),
    ])

  const totalSpent = summary?.totalSpent ?? budget.totalSpent
  const categoriesWithMeta = categories.map((c, i) => ({
    ...c,
    icon: CATEGORY_ICONS[c.label] ?? Receipt,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }))

  const maxMonthly = monthly.length > 0 ? Math.max(...monthly.map((m) => m.amount)) : 1
  const prevMonthTotal = monthly.length >= 2 ? monthly[monthly.length - 2].amount : 0
  const currentTotal = monthly.length >= 1 ? monthly[monthly.length - 1].amount : 0
  const diff = currentTotal - prevMonthTotal
  const isUp = diff > 0

  const fixedVarTotal = fixedVsVar.fixedPaid + fixedVsVar.variable
  const fixedPct = fixedVarTotal > 0 ? Math.round((fixedVsVar.fixedPaid / fixedVarTotal) * 100) : 0
  const varPct = fixedVarTotal > 0 ? 100 - fixedPct : 0

  const balanceTotal = balance.income + balance.expense
  const incomePct = balanceTotal > 0 ? Math.round((balance.income / balanceTotal) * 100) : 0

  const now = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date())

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-100">Análisis</h1>
        <p className="text-sm capitalize text-zinc-500">{now}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500">Gastado (mes)</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-zinc-100">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500">Restante mes</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-emerald-400">
            {formatCurrency(budget.monthRemaining)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500">vs mes anterior</p>
          <div className="mt-1 flex items-center gap-1.5">
            {monthly.length >= 2 ? (
              <>
                {isUp ? (
                  <TrendingUp size={14} className="text-red-400" />
                ) : (
                  <TrendingDown size={14} className="text-emerald-400" />
                )}
                <p className={`text-xl font-bold tabular-nums ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isUp ? '+' : ''}{formatCurrency(diff)}
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-500">Sin datos previos</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500">Disponible hoy</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-zinc-100">
            {formatCurrency(budget.dailyBudget)}
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Fijos vs variables (mes)</h2>
          {fixedVarTotal === 0 ? (
            <p className="text-sm text-zinc-500">Sin gastos registrados este mes</p>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-400">Fijos pagados</span>
                  <span className="text-zinc-200">{formatCurrency(fixedVsVar.fixedPaid)} ({fixedPct}%)</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full bg-amber-500" style={{ width: `${fixedPct}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-400">Gastos variables</span>
                  <span className="text-zinc-200">{formatCurrency(fixedVsVar.variable)} ({varPct}%)</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full bg-violet-500" style={{ width: `${varPct}%` }} />
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Ingresos vs gastos (mes)</h2>
          {balanceTotal === 0 ? (
            <p className="text-sm text-zinc-500">Sin movimientos este mes</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">Ingresos</span>
                <span className="font-semibold tabular-nums text-emerald-400">
                  +{formatCurrency(balance.income)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-400">Gastos</span>
                <span className="font-semibold tabular-nums text-red-400">
                  -{formatCurrency(balance.expense)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full bg-emerald-500" style={{ width: `${incomePct}%` }} />
              </div>
              <p className="text-xs text-zinc-500">
                Balance neto: {formatCurrency(balance.income - balance.expense)}
              </p>
            </div>
          )}
        </section>
      </div>

      {categories.length === 0 && monthly.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 py-12 text-center text-sm text-zinc-500">
          Sin movimientos de gasto registrados. Los datos aparecerán cuando cargues movimientos.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-semibold text-zinc-300">Gasto por categoría</h2>
            {categoriesWithMeta.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin categorías con gastos</p>
            ) : (
              <div className="space-y-3">
                {categoriesWithMeta.map(({ label, amount, percent, icon: Icon, color }) => (
                  <div key={label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={13} className="text-zinc-400" />
                        <span className="text-sm text-zinc-300">{label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500">{percent}%</span>
                        <span className="w-24 text-right text-sm font-medium tabular-nums text-zinc-100">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-semibold text-zinc-300">Tendencia mensual</h2>
            {monthly.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin historial mensual</p>
            ) : (
              <div className="flex h-40 items-end gap-2">
                {monthly.map(({ month, amount }, i) => {
                  const isLast = i === monthly.length - 1
                  const heightPercent = Math.round((amount / maxMonthly) * 100)
                  return (
                    <div key={month} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-[10px] tabular-nums text-zinc-500">
                        {Math.round(amount / 1000)}k
                      </span>
                      <div className="flex w-full flex-1 flex-col justify-end">
                        <div
                          className={`w-full rounded-t-md ${isLast ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${isLast ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {month}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {savingsContrib.length > 0 && (
        <section className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Aportes a ahorros</h2>
          <div className="space-y-2">
            {savingsContrib.map(({ month, ars, usd, eur }) => (
              <div key={month} className="flex justify-between text-sm">
                <span className="capitalize text-zinc-400">{month}</span>
                <div className="flex gap-3 tabular-nums">
                  {ars > 0 && <span className="text-emerald-400">ARS +{formatCurrency(ars)}</span>}
                  {usd > 0 && <span className="text-sky-400">USD +{formatCurrency(usd, 'USD')}</span>}
                  {eur > 0 && <span className="text-violet-400">EUR +{formatCurrency(eur, 'EUR')}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
