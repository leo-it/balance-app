'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteMovement } from '@/actions/movement.actions'
import { EditMovementSheet } from '@/components/expenses/EditMovementSheet'
import { formatTime } from '@/lib/formatters'
import type { Movement } from '@/types/movement'
import { MovementItem } from './MovementItem'

interface MovementListProps {
  movements: Movement[]
}

export function MovementList({ movements }: MovementListProps) {
  const [editing, setEditing] = useState<Movement | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete(movement: Movement) {
    const label = movement.description
    if (!window.confirm(`¿Borrar "${label}"? Esta acción no se puede deshacer.`)) return

    startTransition(async () => {
      await deleteMovement(movement.id)
    })
  }

  return (
    <>
      <div className="divide-y divide-zinc-800/60 rounded-2xl border border-zinc-800 bg-zinc-900 px-4">
        {movements.map((movement) => (
          <div
            key={movement.id}
            className="flex items-center gap-1"
            style={{ opacity: isPending ? 0.6 : 1 }}
          >
            <div className="min-w-0 flex-1">
              <MovementItem
                movement={movement}
                formattedTime={formatTime(movement.createdAt)}
              />
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => setEditing(movement)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Editar movimiento"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(movement)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label="Borrar movimiento"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditMovementSheet movement={editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}
