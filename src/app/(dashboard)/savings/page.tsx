import Link from 'next/link'
import { Target } from 'lucide-react'
import { getUserId } from '@/lib/auth'
import { getBudgetForUser } from '@/lib/data'
import { getSavingsContributionsByMonth } from '@/lib/db'
import { DatabaseSetupRequired } from '@/components/setup/DatabaseSetupRequired'
import { SavingsProgressWidget } from '@/components/metrics/SavingsProgressWidget'
import { formatCurrency, savingsPercent } from '@/lib/formatters'

export default async function SavingsPage() {
  const userId = await getUserId()
  const budget = await getBudgetForUser(userId)
  if (!budget) return <DatabaseSetupRequired />

  const contributions = await getSavingsContributionsByMonth(userId)
  const { savings } = budget
  const arsPercent = savingsPercent(savings.arsCurrent, savings.arsGoal)
  const usdPercent = savingsPercent(savings.usdCurrent, savings.usdGoal)
  const arsRemaining = Math.max(0, savings.arsGoal - savings.arsCurrent)
  const usdRemaining = Math.max(0, savings.usdGoal - savings.usdCurrent)

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-100">Ahorros</h1>
        <p className="text-sm text-zinc-500">Metas separadas en pesos y dólares</p>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Target size={15} className="text-emerald-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Ahorro en pesos
            </span>
          </div>
          <p className="text-3xl font-bold tabular-nums text-zinc-50">
            {formatCurrency(savings.arsCurrent)}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            de {formatCurrency(savings.arsGoal)} · {arsPercent}%
          </p>
          <div className="mt-4">
            <SavingsProgressWidget
              label="Progreso ARS"
              current={savings.arsCurrent}
              goal={savings.arsGoal}
              currency="ARS"
            />
          </div>
          {savings.arsGoal > 0 && (
            <p className="mt-3 text-xs text-zinc-500">
              Faltan {formatCurrency(arsRemaining)} para la meta.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Target size={15} className="text-sky-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Ahorro en dólares
            </span>
          </div>
          <p className="text-3xl font-bold tabular-nums text-zinc-50">
            {formatCurrency(savings.usdCurrent, 'USD')}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            de {formatCurrency(savings.usdGoal, 'USD')} · {usdPercent}%
          </p>
          <div className="mt-4">
            <SavingsProgressWidget
              label="Progreso USD"
              current={savings.usdCurrent}
              goal={savings.usdGoal}
              currency="USD"
            />
          </div>
          {savings.usdGoal > 0 && (
            <p className="mt-3 text-xs text-zinc-500">
              Faltan {formatCurrency(usdRemaining, 'USD')} para la meta.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">Aportes por mes</h2>
        {contributions.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Sin aportes registrados. Al cargar un ingreso, elegí &quot;Aportar a ahorro&quot;.
          </p>
        ) : (
          <div className="space-y-3">
            {contributions.map(({ month, ars, usd }) => (
              <div key={month} className="flex items-center justify-between text-sm">
                <span className="capitalize text-zinc-400">{month}</span>
                <div className="flex gap-4 tabular-nums">
                  {ars > 0 && <span className="text-emerald-400">+{formatCurrency(ars)}</span>}
                  {usd > 0 && (
                    <span className="text-sky-400">+{formatCurrency(usd, 'USD')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-zinc-600">
        Editá metas y saldos en{' '}
        <Link href="/settings" className="text-emerald-400 hover:underline">
          Ajustes
        </Link>
      </p>
    </div>
  )
}
