'use client'

import { useTransition } from 'react'
import { FlaskConical } from 'lucide-react'
import { signInAsDevUser } from '@/actions/dev-auth.actions'

export function DevUserSignInButton() {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => void signInAsDevUser())}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-50"
    >
      <FlaskConical size={16} className="text-amber-400" />
      {pending ? 'Entrando…' : 'Entrar como dev-user'}
    </button>
  )
}
