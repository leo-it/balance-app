'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { X, Wallet } from 'lucide-react'
import { APP_NAME } from '@/lib/app-config'
import { NAV_ITEMS } from '@/lib/nav-items'
import { SignOutControl } from './SignOutControl'
import { cn } from '@/lib/utils'

interface MobileNavDrawerProps {
  open: boolean
  onClose: () => void
  userFirstName: string
  userInitial: string
  isDevAuth: boolean
}

export function MobileNavDrawer({
  open,
  onClose,
  userFirstName,
  userInitial,
  isDevAuth,
}: MobileNavDrawerProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            aria-label="Cerrar menú"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,280px)] flex-col border-r border-zinc-800 bg-zinc-950 lg:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Wallet size={15} className="text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-zinc-100">{APP_NAME}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-300 uppercase">
                {userInitial}
              </div>
              <span className="truncate text-sm font-medium text-zinc-200">{userFirstName}</span>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                      isActive
                        ? 'bg-zinc-800 font-medium text-zinc-50'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
                    )}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-zinc-800 p-3">
              <SignOutControl isDevAuth={isDevAuth} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
