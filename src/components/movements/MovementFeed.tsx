import type { Movement } from '@/types/movement'
import { MovementList } from './MovementList'

interface MovementFeedProps {
  movements: Movement[]
}

export function MovementFeed({ movements }: MovementFeedProps) {
  if (movements.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Movimientos recientes
        </h2>
        <p className="py-6 text-center text-sm text-zinc-600">
          Sin movimientos aún. Usá el botón + para registrar uno.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-1">
      <div className="pb-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Movimientos recientes
        </h2>
        <p className="mt-1 text-xs text-zinc-600">
          Registrá gastos e ingresos y marcálos como pagados o cobrados cuando se concreten.
        </p>
      </div>

      <MovementList movements={movements} />
    </section>
  )
}
