'use client'

import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useTransform, motion } from 'motion/react'
import { formatCurrency } from '@/lib/formatters'
import { Wallet } from 'lucide-react'

interface DailyBudgetWidgetProps {
  amount: number
}

export function DailyBudgetWidget({ amount }: DailyBudgetWidgetProps) {
  const motionValue = useMotionValue(amount)
  const prevAmount = useRef(amount)

  const displayValue = useTransform(motionValue, (v) =>
    formatCurrency(Math.round(v)),
  )

  useEffect(() => {
    if (prevAmount.current === amount) return
    const controls = animate(motionValue, amount, {
      duration: 0.7,
      ease: 'easeOut',
    })
    prevAmount.current = amount
    return controls.stop
  }, [amount, motionValue])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-zinc-400">
        <Wallet size={13} />
        <span className="text-xs font-medium tracking-wide uppercase">Disponible hoy</span>
      </div>
      <motion.span className="text-2xl font-bold tabular-nums text-zinc-50 leading-none">
        {displayValue}
      </motion.span>
      <p className="text-[11px] leading-snug text-zinc-500">
        Promedio diario según lo gastable del mes (resta fijos pendientes)
      </p>
    </div>
  )
}
