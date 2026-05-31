'use client'

import { usePathname } from 'next/navigation'
import { navLabelForPath } from '@/lib/nav-items'
import { SignOutControl } from './SignOutControl'

interface DesktopHeaderProps {
  userFirstName?: string
  userInitial?: string
  isDevAuth: boolean
}

export function DesktopHeader({
  userFirstName = 'Usuario',
  userInitial = 'U',
  isDevAuth,
}: DesktopHeaderProps) {
  const pathname = usePathname()
  const pageTitle = navLabelForPath(pathname)
  const subtitle =
    pathname === '/' ? userFirstName : `Hola, ${userFirstName}`

  return (
    <header className="hidden h-16 items-center justify-between border-b border-zinc-800 px-8 lg:flex">
      <div>
        <h1 className="text-base font-semibold text-zinc-100">{pageTitle}</h1>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 uppercase">
          {userInitial}
        </div>
        <SignOutControl
          isDevAuth={isDevAuth}
          variant="inline"
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-red-400"
        />
      </div>
    </header>
  )
}
