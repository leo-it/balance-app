import { formatTime } from '@/lib/formatters'
import type { Movement } from '@/types/movement'
import { MovementItem } from './MovementItem'

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
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1">
        Movimientos recientes
      </h2>

      <div className="divide-y divide-zinc-800/60 rounded-2xl border border-zinc-800 bg-zinc-900 px-4">
        {movements.map((movement) => (
          <MovementItem
            key={movement.id}
            movement={movement}
            formattedTime={formatTime(movement.createdAt)}
          />
        ))}
      </div>
    </section>
  )
}
