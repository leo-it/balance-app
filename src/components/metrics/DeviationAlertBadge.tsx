'use client'

import { motion } from 'motion/react'
import type { DeviationStatus } from '@/types/budget'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeviationAlertBadgeProps {
  status: DeviationStatus
}

const CONFIG = {
  ok: {
    label: 'Ritmo normal',
    Icon: CheckCircle2,
    className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  warning: {
    label: 'Desvío leve',
    Icon: AlertTriangle,
    className: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  alert: {
    label: 'Desvío alto',
    Icon: XCircle,
    className: 'text-red-400 bg-red-400/10 border-red-400/20',
  },
}

export function DeviationAlertBadge({ status }: DeviationAlertBadgeProps) {
  const { label, Icon, className } = CONFIG[status]

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      <Icon size={12} />
      {label}
    </motion.div>
  )
}
