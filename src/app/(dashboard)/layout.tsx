import { getCurrentUserInfo, hasDevSession } from '@/lib/auth'
import { isDualCurrencySchemaReady } from '@/lib/db'
import { AddExpenseFab } from '@/components/expenses/AddExpenseFab'
import { Sidebar } from '@/components/layout/Sidebar'
import { DesktopHeader } from '@/components/layout/DesktopHeader'
import { MobileTopBar } from '@/components/layout/MobileTopBar'
import { SchemaMigrationBanner } from '@/components/setup/SchemaMigrationBanner'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, schemaReady, isDevAuth] = await Promise.all([
    getCurrentUserInfo(),
    isDualCurrencySchemaReady(),
    hasDevSession(),
  ])

  return (
    <div className="flex min-h-dvh bg-zinc-950">
      <Sidebar
        userFirstName={user.firstName}
        userInitial={user.initial}
        isDevAuth={isDevAuth}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileTopBar
          userFirstName={user.firstName}
          userInitial={user.initial}
          isDevAuth={isDevAuth}
        />
        <DesktopHeader
          userFirstName={user.firstName}
          userInitial={user.initial}
          isDevAuth={isDevAuth}
        />
        {!schemaReady && <SchemaMigrationBanner />}
        <main className="relative flex-1 overflow-y-auto pb-24">
          {children}
          <AddExpenseFab />
        </main>
      </div>
    </div>
  )
}
