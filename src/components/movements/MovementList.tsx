'use client'

import { useOptimistic, useState, useTransition } from 'react'
import {
  deleteMovement,
  markMovementPaid,
  undoMovementPaid,
} from '@/actions/movement.actions'
import { EditMovementSheet } from '@/components/expenses/EditMovementSheet'
import type { Movement } from '@/types/movement'
import { MovementCard } from './MovementCard'

interface MovementListProps {
  movements: Movement[]
}

export function MovementList({ movements }: MovementListProps) {
  const [, startTransition] = useTransition()
  const [editing, setEditing] = useState<Movement | null>(null)

  const [optimisticMovements, applyOptimistic] = useOptimistic(
    movements,
    (
      state: Movement[],
      update:
        | { type: 'status'; id: string; status: 'pending' | 'paid' }
        | { type: 'delete'; id: string },
    ) => {
      if (update.type === 'delete') {
        return state.filter((m) => m.id !== update.id)
      }
      return state.map((m) =>
        m.id === update.id
          ? {
              ...m,
              status: update.status,
              paidAt: update.status === 'paid' ? new Date().toISOString() : undefined,
            }
          : m,
      )
    },
  )

  function handlePay(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: 'status', id, status: 'paid' })
      await markMovementPaid(id)
    })
  }

  function handleUndo(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: 'status', id, status: 'pending' })
      await undoMovementPaid(id)
    })
  }

  function handleDelete(id: string) {
    const movement = optimisticMovements.find((m) => m.id === id)
    if (!movement) return
    if (!window.confirm(`¿Borrar "${movement.description}"? Esta acción no se puede deshacer.`)) {
      return
    }

    startTransition(async () => {
      applyOptimistic({ type: 'delete', id })
      await deleteMovement(id)
    })
  }

  const pending = optimisticMovements.filter((m) => m.status === 'pending')
  const paid = optimisticMovements.filter((m) => m.status === 'paid')

  return (
    <>
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-amber-400">Pendientes de confirmar</p>
          {pending.map((movement) => (
            <MovementCard
              key={movement.id}
              movement={movement}
              onPay={handlePay}
              onUndo={handleUndo}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {paid.length > 0 && (
        <div className="space-y-2">
          {pending.length > 0 && <p className="text-xs text-zinc-600">Confirmados</p>}
          {paid.map((movement) => (
            <MovementCard
              key={movement.id}
              movement={movement}
              onPay={handlePay}
              onUndo={handleUndo}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editing && (
        <EditMovementSheet movement={editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}
