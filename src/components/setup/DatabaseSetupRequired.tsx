import { Database } from 'lucide-react'

export function DatabaseSetupRequired() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
        <Database size={28} className="text-amber-400" />
      </div>
      <h1 className="text-lg font-semibold text-zinc-100">Base de datos sin configurar</h1>
      <p className="mt-2 text-sm text-zinc-400">
        La conexión funciona, pero faltan las tablas. Ejecutá el script de setup una sola vez.
      </p>

      <ol className="mt-6 w-full space-y-3 text-left text-sm text-zinc-300">
        <li className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
          <span className="font-medium text-zinc-100">1.</span> Abrí el panel de tu proveedor de
          base de datos (SQL Editor o equivalente).
        </li>
        <li className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
          <span className="font-medium text-zinc-100">2.</span> Copiá y ejecutá todo el archivo{' '}
          <code className="text-emerald-400">db/setup.sql</code> del proyecto
        </li>
        <li className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
          <span className="font-medium text-zinc-100">3.</span> Recargá esta página
        </li>
      </ol>

      <p className="mt-6 text-xs text-zinc-600">
        Opcional: después ejecutá <code className="text-zinc-500">db/seed.sql</code> para datos de
        ejemplo.
      </p>
    </div>
  )
}
