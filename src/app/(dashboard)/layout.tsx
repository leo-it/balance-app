import { getCurrentUserInfo } from '@/lib/auth'
import { isDualCurrencySchemaReady } from '@/lib/db'
import { AddExpenseFab } from '@/components/expenses/AddExpenseFab'
import { Sidebar } from '@/components/layout/Sidebar'
import { DesktopHeader } from '@/components/layout/DesktopHeader'
import { SchemaMigrationBanner } from '@/components/setup/SchemaMigrationBanner'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, schemaReady] = await Promise.all([
    getCurrentUserInfo(),
    isDualCurrencySchemaReady(),
  ])

  return (
    <div className="flex min-h-dvh bg-zinc-950">
      <Sidebar userName={user.firstName} userInitial={user.initial} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DesktopHeader userName={user.firstName} userInitial={user.initial} />
        {!schemaReady && <SchemaMigrationBanner />}
        <main className="relative flex-1 overflow-y-auto pb-24">
          {children}
          <AddExpenseFab />
        </main>
      </div>
    </div>
  )
}
