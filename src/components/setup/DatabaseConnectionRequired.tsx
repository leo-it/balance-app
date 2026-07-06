import { WifiOff } from 'lucide-react'

export function DatabaseConnectionRequired() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
        <WifiOff size={28} className="text-red-400" />
      </div>
      <h1 className="text-lg font-semibold text-zinc-100">No se pudo conectar a la base de datos</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Supabase no respondió. Revisá que el proyecto esté activo y que las credenciales en{' '}
        <code className="text-zinc-300">.env.local</code> sean correctas.
      </p>

      <ol className="mt-6 w-full space-y-3 text-left text-sm text-zinc-300">
        <li className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
          <span className="font-medium text-zinc-100">1.</span> Entrá a{' '}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300"
          >
            supabase.com/dashboard
          </a>{' '}
          y verificá que el proyecto no esté pausado.
        </li>
        <li className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
          <span className="font-medium text-zinc-100">2.</span> Confirmá{' '}
          <code className="text-emerald-400">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
          <code className="text-emerald-400">SUPABASE_SERVICE_ROLE_KEY</code> en{' '}
          <code className="text-zinc-400">.env.local</code>.
        </li>
        <li className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
          <span className="font-medium text-zinc-100">3.</span> Reiniciá{' '}
          <code className="text-zinc-400">pnpm dev</code> y recargá.
        </li>
      </ol>
    </div>
  )
}
