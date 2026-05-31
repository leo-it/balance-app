'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { formatCurrency, savingsPercent } from '@/lib/formatters'
import { TrendingUp } from 'lucide-react'

interface SavingsProgressWidgetProps {
  label?: string
  current: number
  goal: number
  currency?: 'ARS' | 'USD' | 'EUR'
}

export function SavingsProgressWidget({
  label = 'Meta de ahorro',
  current,
  goal,
  currency = 'ARS',
}: SavingsProgressWidgetProps) {
  const [mounted, setMounted] = useState(false)
  const percent = savingsPercent(current, goal)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <TrendingUp size={13} />
          <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
        </div>
        <span className="text-xs font-semibold text-emerald-400">{percent}%</span>
      </div>

      <div className="relative h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={mounted ? { width: `${percent}%` } : { width: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>

      <div className="flex justify-between text-xs text-zinc-500">
        <span>{mounted ? formatCurrency(current, currency) : '—'}</span>
        <span>{mounted ? formatCurrency(goal, currency) : '—'}</span>
      </div>
    </div>
  )
}
