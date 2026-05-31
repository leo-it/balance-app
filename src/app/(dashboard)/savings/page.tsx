import Link from 'next/link'
import { Target } from 'lucide-react'
import { getUserId } from '@/lib/auth'
import { getBudgetForUser } from '@/lib/data'
import { getAllMovements, getSavingsContributionsByMonth } from '@/lib/db'
import { resolveCryptoSavingsBalances } from '@/lib/domain/budget'
import { DatabaseSetupRequired } from '@/components/setup/DatabaseSetupRequired'
import { SavingsProgressWidget } from '@/components/metrics/SavingsProgressWidget'
import { formatCryptoAmount, formatCurrency, savingsPercent } from '@/lib/formatters'

export default async function SavingsPage() {
  const userId = await getUserId()
  const budget = await getBudgetForUser(userId)
  if (!budget) return <DatabaseSetupRequired />

  const [contributions, movements] = await Promise.all([
    getSavingsContributionsByMonth(userId),
    getAllMovements(userId),
  ])

  const { savings } = budget
  const arsPercent = savingsPercent(savings.arsCurrent, savings.arsGoal)
  const usdPercent = savingsPercent(savings.usdCurrent, savings.usdGoal)
  const eurPercent = savingsPercent(savings.eurCurrent, savings.eurGoal)
  const arsRemaining = Math.max(0, savings.arsGoal - savings.arsCurrent)
  const usdRemaining = Math.max(0, savings.usdGoal - savings.usdCurrent)
  const eurRemaining = Math.max(0, savings.eurGoal - savings.eurCurrent)
  const cryptoBalances = resolveCryptoSavingsBalances(savings.crypto, movements)
  const cryptoEntries = Object.entries(cryptoBalances)

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-100">Ahorros</h1>
        <p className="text-sm text-zinc-500">Metas en pesos, dólares, euros y cripto</p>
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

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Target size={15} className="text-violet-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Ahorro en euros
            </span>
          </div>
          <p className="text-3xl font-bold tabular-nums text-zinc-50">
            {formatCurrency(savings.eurCurrent, 'EUR')}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            de {formatCurrency(savings.eurGoal, 'EUR')} · {eurPercent}%
          </p>
          <div className="mt-4">
            <SavingsProgressWidget
              label="Progreso EUR"
              current={savings.eurCurrent}
              goal={savings.eurGoal}
              currency="EUR"
            />
          </div>
          {savings.eurGoal > 0 && (
            <p className="mt-3 text-xs text-zinc-500">
              Faltan {formatCurrency(eurRemaining, 'EUR')} para la meta.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Target size={15} className="text-orange-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Ahorro en cripto
            </span>
          </div>
          {cryptoEntries.length > 0 ? (
            <div className="space-y-3">
              {cryptoEntries.map(([symbol, amount]) => (
                <div key={symbol} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{symbol}</span>
                  <span className="text-lg font-semibold tabular-nums text-zinc-50">
                    {formatCryptoAmount(amount, symbol)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Sin saldo en cripto. Al cargar un ingreso, elegí aportar al ahorro en cripto.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">Aportes por mes</h2>
        {contributions.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Sin aportes registrados. Al cargar un ingreso, elegí aportar al ahorro.
          </p>
        ) : (
          <div className="space-y-3">
            {contributions.map(({ month, ars, usd, eur, crypto }) => {
              const cryptoLines = Object.entries(crypto)
              const hasAny =
                ars > 0 || usd > 0 || eur > 0 || cryptoLines.some(([, amount]) => amount > 0)

              if (!hasAny) return null

              return (
                <div key={month} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-zinc-400">{month}</span>
                  <div className="flex flex-wrap justify-end gap-3 tabular-nums">
                    {ars > 0 && <span className="text-emerald-400">+{formatCurrency(ars)}</span>}
                    {usd > 0 && (
                      <span className="text-sky-400">+{formatCurrency(usd, 'USD')}</span>
                    )}
                    {eur > 0 && (
                      <span className="text-violet-400">+{formatCurrency(eur, 'EUR')}</span>
                    )}
                    {cryptoLines.map(([symbol, amount]) =>
                      amount > 0 ? (
                        <span key={symbol} className="text-orange-400">
                          +{formatCryptoAmount(amount, symbol)}
                        </span>
                      ) : null,
                    )}
                  </div>
                </div>
              )
            })}
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
