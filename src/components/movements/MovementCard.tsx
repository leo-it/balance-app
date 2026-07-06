'use client'

import { useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ShoppingCart, Banknote, Fuel, Pill, ArrowDownLeft, ArrowUpRight,
  Coffee, Bus, Utensils, Receipt, Tv, Wifi, Home, Music,
  CheckCircle2, Undo2, Loader2, Pencil, Trash2, Bell,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatMovementAmount, formatTime } from '@/lib/formatters'
import { currencyLabel, savingsTargetLabel } from '@/lib/savings-labels'
import { cn } from '@/lib/utils'
import type { Movement } from '@/types/movement'

const ICONS: Record<string, React.ElementType> = {
  ShoppingCart, Banknote, Fuel, Pill, ArrowDownLeft, ArrowUpRight,
  Coffee, Bus, Utensils, Receipt, Tv, Wifi, Home, Music,
}

interface MovementCardProps {
  movement: Movement
  onPay: (id: string) => void
  onUndo: (id: string) => void
  onEdit: (movement: Movement) => void
  onDelete: (id: string) => void
}

export function MovementCard({ movement, onPay, onUndo, onEdit, onDelete }: MovementCardProps) {
  const [isPending, startTransition] = useTransition()
  const Icon = ICONS[movement.iconName] ?? Receipt
  const isIncome = movement.type === 'income'
  const isPaid = movement.status === 'paid'
  const currencyBadge = currencyLabel(movement.currency, movement.cryptoSymbol)
  const isCrypto =
    movement.currency === 'CRYPTO' ||
    movement.savingsTarget === 'crypto' ||
    Boolean(movement.cryptoSymbol)

  function handlePay() {
    startTransition(() => {
      onPay(movement.id)
    })
  }

  function handleUndo() {
    startTransition(() => {
      onUndo(movement.id)
    })
  }

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3 transition-colors',
        isPaid
          ? isIncome
            ? 'border-emerald-500/20 bg-emerald-500/5'
            : 'border-zinc-800 bg-zinc-900/80'
          : 'border-amber-500/20 bg-amber-500/5',
        isPending && 'opacity-60',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400',
        )}
      >
        <Icon size={16} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              'border px-1.5 py-0 text-[10px] font-medium',
              isIncome
                ? 'border-emerald-500/30 text-emerald-400'
                : 'border-zinc-600 text-zinc-400',
            )}
          >
            {isIncome ? 'Ingreso' : 'Gasto'}
          </Badge>
          {(movement.currency !== 'ARS' || isCrypto) && (
            <Badge variant="outline" className="border-zinc-600 px-1.5 py-0 text-[10px] text-zinc-400">
              {currencyBadge}
            </Badge>
          )}
          {movement.savingsTarget !== 'none' && (
            <Badge variant="outline" className="border-amber-500/30 px-1.5 py-0 text-[10px] text-amber-400">
              {savingsTargetLabel(movement.savingsTarget, movement.cryptoSymbol)}
            </Badge>
          )}
        </div>
        <span
          className={cn(
            'flex items-center gap-1.5 truncate text-sm font-medium leading-tight',
            isPaid && !isIncome ? 'text-zinc-400 line-through' : 'text-zinc-100',
          )}
        >
          {movement.description}
          {movement.reminder && (
            <Bell size={12} className="shrink-0 text-amber-400" aria-label="Con recordatorio" />
          )}
        </span>
        <span className="text-xs text-zinc-500">
          {movement.category} · {formatTime(movement.createdAt)}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            isIncome ? 'text-emerald-400' : 'text-zinc-100',
          )}
        >
          {isIncome ? '+' : '-'}
          {formatMovementAmount(
            movement.amount,
            movement.currency,
            movement.cryptoSymbol,
            movement.savingsTarget,
          )}
        </span>

        <div className="flex items-center gap-0.5">
          {!isPending && (
            <>
              <button
                type="button"
                onClick={() => onEdit(movement)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Editar movimiento"
              >
                <Pencil size={12} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(movement.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label="Borrar movimiento"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {isPending ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex h-7 w-7 items-center justify-center"
              >
                <Loader2 size={14} className="animate-spin text-zinc-400" />
              </motion.div>
            ) : isPaid ? (
              <motion.button
                key="undo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleUndo}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Marcar como pendiente"
              >
                <Undo2 size={13} />
              </motion.button>
            ) : (
              <motion.button
                key="pay"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handlePay}
                className="flex h-7 items-center gap-1 rounded-lg bg-zinc-800 px-2 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                aria-label={isIncome ? 'Marcar como cobrado' : 'Marcar como pagado'}
              >
                <CheckCircle2 size={11} />
                {isIncome ? 'Cobrado' : 'Pagado'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
