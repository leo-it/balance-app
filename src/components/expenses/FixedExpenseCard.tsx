'use client'

import { useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Home, Wifi, Shield, Dumbbell, Music, Tv, Car, Zap,
  Receipt, CheckCircle2, Undo2, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import type { FixedExpense } from '@/types/expense'

const ICONS: Record<string, React.ElementType> = {
  Home, Wifi, Shield, Dumbbell, Music, Tv, Car, Zap, Receipt,
}

interface FixedExpenseCardProps {
  expense: FixedExpense
  onPay: (id: string) => void
  onUndo: (id: string) => void
}

export function FixedExpenseCard({ expense, onPay, onUndo }: FixedExpenseCardProps) {
  const [isPending, startTransition] = useTransition()
  const Icon = ICONS[expense.iconName] ?? Receipt
  const isPaid = expense.status === 'paid'

  function handlePay() {
    startTransition(() => {
      onPay(expense.id)
    })
  }

  function handleUndo() {
    startTransition(() => {
      onUndo(expense.id)
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
          ? 'border-emerald-500/20 bg-emerald-500/5'
          : 'border-zinc-800 bg-zinc-900',
        isPending && 'opacity-60',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400',
        )}
      >
        <Icon size={16} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            'text-sm font-medium leading-tight',
            isPaid ? 'text-zinc-400 line-through' : 'text-zinc-100',
          )}
        >
          {expense.label}
        </span>
        <span className="text-xs text-zinc-500">{formatCurrency(expense.amount)}</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex h-8 w-8 items-center justify-center"
          >
            <Loader2 size={16} className="animate-spin text-zinc-400" />
          </motion.div>
        ) : isPaid ? (
          <motion.button
            key="undo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleUndo}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 active:scale-95"
            aria-label="Deshacer pago"
          >
            <Undo2 size={14} />
          </motion.button>
        ) : (
          <motion.button
            key="pay"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handlePay}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 active:scale-95"
            aria-label="Cargar pago"
          >
            <CheckCircle2 size={12} />
            Cargar
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
