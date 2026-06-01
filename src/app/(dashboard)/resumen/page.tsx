import { getUserId } from '@/lib/auth'
import { getBudgetForUser } from '@/lib/data'
import { getRecentMovements } from '@/lib/db'
import { DatabaseSetupRequired } from '@/components/setup/DatabaseSetupRequired'
import { ResumenWidgetView } from '@/components/widget/ResumenWidgetView'

export default async function ResumenPage() {
  const userId = await getUserId()
  const budget = await getBudgetForUser(userId)
  if (!budget) return <DatabaseSetupRequired />

  const movements = await getRecentMovements(userId, 3)

  return <ResumenWidgetView budget={budget} movements={movements} />
}
