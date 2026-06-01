'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet } from 'lucide-react'
import { APP_NAME } from '@/lib/app-config'
import { NAV_ITEMS } from '@/lib/nav-items'
import { SignOutControl } from './SignOutControl'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userFirstName?: string
  userInitial?: string
  isDevAuth: boolean
}

export function Sidebar({
  userFirstName = 'Usuario',
  userInitial = 'U',
  isDevAuth,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-zinc-800 lg:bg-zinc-950">
      <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
          <Wallet size={15} className="text-emerald-400" />
        </div>
        <span className="text-sm font-semibold text-zinc-100">{APP_NAME}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-zinc-800 font-medium text-zinc-50'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-zinc-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 uppercase">
            {userInitial}
          </div>
          <span className="truncate text-sm text-zinc-400">{userFirstName}</span>
        </div>
        <SignOutControl isDevAuth={isDevAuth} />
      </div>
    </aside>
  )
}
