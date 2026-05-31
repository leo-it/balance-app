'use client'

import { useTransition } from 'react'
import { SignOutButton } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'
import { signOutDevUser } from '@/actions/dev-auth.actions'
import { cn } from '@/lib/utils'

const buttonClass =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400'

interface SignOutControlProps {
  isDevAuth: boolean
  className?: string
  variant?: 'sidebar' | 'inline'
}

export function SignOutControl({
  isDevAuth,
  className,
  variant = 'sidebar',
}: SignOutControlProps) {
  const [pending, startTransition] = useTransition()
  const mergedClass = cn(variant === 'sidebar' ? buttonClass : undefined, className)

  if (isDevAuth) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => void signOutDevUser())}
        className={mergedClass}
      >
        <LogOut size={16} />
        {pending ? 'Saliendo…' : 'Cerrar sesión'}
      </button>
    )
  }

  return (
    <SignOutButton redirectUrl="/login">
      <button type="button" className={mergedClass}>
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </SignOutButton>
  )
}
