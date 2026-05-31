'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Wallet } from 'lucide-react'
import { navLabelForPath } from '@/lib/nav-items'
import { MobileNavDrawer } from './MobileNavDrawer'

interface MobileTopBarProps {
  userFirstName: string
  userInitial: string
  isDevAuth: boolean
}

export function MobileTopBar({ userFirstName, userInitial, isDevAuth }: MobileTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isDashboard = pathname === '/'
  const title = isDashboard ? userFirstName : navLabelForPath(pathname)

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-zinc-800 bg-zinc-950/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          {!isDashboard && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Wallet size={14} className="text-emerald-400" />
            </div>
          )}
          <h1 className="truncate text-base font-semibold text-zinc-50">{title}</h1>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 uppercase">
          {userInitial}
        </div>
      </header>

      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        userFirstName={userFirstName}
        userInitial={userInitial}
        isDevAuth={isDevAuth}
      />
    </>
  )
}
