import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { APP_NAME } from '@/lib/app-config'
import { DevUserSignInButton } from '@/components/auth/DevUserSignInButton'
import { ClerkSetupRequired } from '@/components/setup/ClerkSetupRequired'
import { hasValidClerkKey } from '@/lib/auth'
import { isDevAuthAllowed } from '@/lib/dev-session'

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Wallet size={22} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-zinc-400">Gestor de gastos inteligente</p>
          </div>
        </div>

        {hasValidClerkKey ? (
          <ClerkSignIn />
        ) : (
          <>
            <ClerkSetupRequired />
            {isDevAuthAllowed() && <DevUserSignInButton />}
          </>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
            Registrate gratis
          </Link>
        </p>
      </div>
    </main>
  )
}

async function ClerkSignIn() {
  const { SignIn } = await import('@clerk/nextjs')
  return (
    <SignIn
      appearance={{
        variables: {
          colorBackground: '#18181b',
          colorInputBackground: '#27272a',
          colorInputText: '#fafafa',
          colorText: '#fafafa',
          colorTextSecondary: '#a1a1aa',
          colorPrimary: '#10b981',
          colorDanger: '#ef4444',
          borderRadius: '0.75rem',
          fontFamily: 'inherit',
        },
        elements: {
          card: 'shadow-none border border-zinc-800 bg-zinc-900',
          headerTitle: 'hidden',
          headerSubtitle: 'hidden',
          socialButtonsBlockButton:
            'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
          dividerLine: 'bg-zinc-800',
          dividerText: 'text-zinc-500',
          formFieldLabel: 'text-zinc-400',
          formFieldInput: 'border-zinc-700',
          footerActionLink: 'text-emerald-400',
        },
      }}
    />
  )
}
