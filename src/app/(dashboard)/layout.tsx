import { getCurrentUserInfo } from '@/lib/auth'
import { AddExpenseFab } from '@/components/expenses/AddExpenseFab'
import { Sidebar } from '@/components/layout/Sidebar'
import { DesktopHeader } from '@/components/layout/DesktopHeader'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUserInfo()

  return (
    <div className="flex min-h-dvh bg-zinc-950">
      <Sidebar userName={user.firstName} userInitial={user.initial} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DesktopHeader userName={user.firstName} userInitial={user.initial} />
        <main className="relative flex-1 overflow-y-auto pb-24">
          {children}
          <AddExpenseFab />
        </main>
      </div>
    </div>
  )
}
