import { KeyRound } from 'lucide-react'

export function ClerkSetupRequired() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left text-sm text-amber-400">
      <div className="mb-2 flex items-center gap-2 font-medium text-zinc-100">
        <KeyRound size={16} className="text-amber-400" />
        Autenticación requerida
      </div>
      <p className="text-xs text-amber-500/90">
        Configurá Clerk en <code className="text-amber-300">.env.local</code> con tus keys reales
        (no uses <code className="text-amber-300">pk_test_placeholder</code>).
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs text-zinc-400">
        <li>
          Creá una app en{' '}
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            dashboard.clerk.com
          </a>
        </li>
        <li>Copiá Publishable key y Secret key a <code className="text-zinc-500">.env.local</code></li>
        <li>Reiniciá <code className="text-zinc-500">pnpm dev</code></li>
      </ol>
    </div>
  )
}
