import Link from 'next/link'
import { Smartphone } from 'lucide-react'
import { InstallAppCard } from '@/components/install/InstallAppCard'

export default function InstalarPage() {
  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6">
      <div className="mb-6 lg:hidden">
        <p className="text-sm text-zinc-500">App en tu pantalla de inicio</p>
      </div>
      <div className="mb-6 hidden lg:block">
        <h1 className="text-lg font-semibold text-zinc-100">Instalar en el celular</h1>
        <p className="text-sm text-zinc-500">PWA + acceso rápido a resumen</p>
      </div>

      <div className="mx-auto max-w-md space-y-4">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-200">Instalación</h2>
          </div>
          <InstallAppCard />
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-200">Vista resumen (dentro de la app)</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Atajo web en{' '}
            <Link href="/resumen" className="text-emerald-400 hover:underline">
              /resumen
            </Link>
            . Abrís la app y ves una pantalla compacta — <strong className="text-zinc-300">no</strong>{' '}
            un widget del sistema que muestre números sin tocar nada.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Por defecto: <strong className="text-zinc-300">restante gastable</strong>,{' '}
            <strong className="text-zinc-300">gastos del mes</strong> y{' '}
            <strong className="text-zinc-300">ahorro USD</strong>.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li>
              • Personalizá qué métricas ver con el ícono ⚙ en{' '}
              <Link href="/resumen" className="text-emerald-400 hover:underline">
                /resumen
              </Link>
            </li>
            <li>• La elección se guarda en este celular</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
