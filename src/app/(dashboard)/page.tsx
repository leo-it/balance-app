import { getUserId } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import { MetricsHeader } from '@/components/metrics/MetricsHeader'
import { FixedExpenseList } from '@/components/expenses/FixedExpenseList'
import { MovementFeed } from '@/components/movements/MovementFeed'
import { DatabaseConnectionRequired } from '@/components/setup/DatabaseConnectionRequired'
import { DatabaseSetupRequired } from '@/components/setup/DatabaseSetupRequired'

export default async function DashboardPage() {
  const userId = await getUserId()
  const data = await getDashboardData(userId)

  if (data.status === 'unreachable') {
    return (
      <div className="px-4 py-5 lg:px-8 lg:py-6">
        <DatabaseConnectionRequired />
      </div>
    )
  }

  if (data.status === 'missing_tables') {
    return (
      <div className="px-4 py-5 lg:px-8 lg:py-6">
        <DatabaseSetupRequired />
      </div>
    )
  }

  const { budget, expenses, movements } = data

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6">
      <div className="mt-0 lg:mt-0 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <MetricsHeader budget={budget} />
          <FixedExpenseList expenses={expenses} />
        </div>

        <div className="mt-5 lg:mt-0">
          <MovementFeed movements={movements} />
        </div>
      </div>
    </div>
  )
}
