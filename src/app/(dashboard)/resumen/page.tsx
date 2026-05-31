import Link from 'next/link'
import { getUserId } from '@/lib/auth'
import { getBudgetForUser } from '@/lib/data'
import { getRecentMovements } from '@/lib/db'
import { DatabaseSetupRequired } from '@/components/setup/DatabaseSetupRequired'
import { formatCurrency, formatMovementAmount } from '@/lib/formatters'
import { Wallet, ChevronRight } from 'lucide-react'

export default async function ResumenPage() {
  const userId = await getUserId()
  const budget = await getBudgetForUser(userId)
  if (!budget) return <DatabaseSetupRequired />

  const movements = await getRecentMovements(userId, 3)

  return (
    <Link href="/" className="block min-h-dvh bg-zinc-950 px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Wallet size={16} className="text-emerald-400" />
            </div>
            <span className="font-semibold text-zinc-100">Linkeweb</span>
          </div>
          <ChevronRight size={18} className="text-zinc-600" />
        </div>

        <p className="mb-4 text-xs text-zinc-500">Tocá para abrir la app completa</p>

        <div className="space-y-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Disponible hoy</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-zinc-50">
              {formatCurrency(budget.dailyBudget)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Restante gastable: {formatCurrency(budget.spendableRemaining)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-[10px] uppercase text-zinc-500">Ahorro ARS</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-zinc-100">
                {formatCurrency(budget.savings.arsCurrent)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-[10px] uppercase text-zinc-500">Ahorro USD</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-zinc-100">
                {formatCurrency(budget.savings.usdCurrent, 'USD')}
              </p>
            </div>
            {(budget.savings.eurCurrent > 0 || budget.savings.eurGoal > 0) && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-[10px] uppercase text-zinc-500">Ahorro EUR</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-zinc-100">
                  {formatCurrency(budget.savings.eurCurrent, 'EUR')}
                </p>
              </div>
            )}
          </div>

          {movements.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                Últimos movimientos
              </p>
              <div className="space-y-2">
                {movements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-zinc-300">{m.description}</span>
                    <span
                      className={
                        m.type === 'income' ? 'text-emerald-400' : 'text-zinc-100'
                      }
                    >
                      {m.type === 'income' ? '+' : '-'}
                      {formatMovementAmount(m.amount, m.currency, m.cryptoSymbol, m.savingsTarget)}
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
