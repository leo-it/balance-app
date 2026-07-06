import { getCurrentUserInfo, getUserId, hasDevSession } from '@/lib/auth'
import { getScheduledReminders, isDatabaseReachable, isDualCurrencySchemaReady } from '@/lib/db'
import { AddExpenseFab } from '@/components/expenses/AddExpenseFab'
import { Sidebar } from '@/components/layout/Sidebar'
import { DesktopHeader } from '@/components/layout/DesktopHeader'
import { MobileTopBar } from '@/components/layout/MobileTopBar'
import { MobileInstallBanner } from '@/components/install/MobileInstallBanner'
import { DatabaseConnectionRequired } from '@/components/setup/DatabaseConnectionRequired'
import { SchemaMigrationBanner } from '@/components/setup/SchemaMigrationBanner'
import { WidgetNativeSync } from '@/components/widget/WidgetNativeSync'
import { ReminderNativeSync } from '@/components/reminders/ReminderNativeSync'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userId = await getUserId()
  const [user, dbReachable, schemaReady, isDevAuth, reminders] = await Promise.all([
    getCurrentUserInfo(),
    isDatabaseReachable(),
    isDualCurrencySchemaReady(),
    hasDevSession(),
    getScheduledReminders(userId),
  ])

  if (!dbReachable) {
    return (
      <div className="flex min-h-dvh bg-zinc-950">
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <DatabaseConnectionRequired />
        </main>
      </div>
    )
  }

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
        <MobileInstallBanner />
        <main className="relative flex-1 overflow-y-auto pb-24">
          <WidgetNativeSync userId={userId} />
          <ReminderNativeSync reminders={reminders} />
          {children}
          <AddExpenseFab />
        </main>
      </div>
    </div>
  )
}
