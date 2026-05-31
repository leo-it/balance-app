import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart, Banknote, Fuel, Pill, ArrowDownLeft, ArrowUpRight,
  Coffee, Bus, Utensils, Receipt, Tv, Wifi, Home, Music,
} from 'lucide-react'
import { formatMovementAmount, formatTime } from '@/lib/formatters'
import { currencyLabel, savingsTargetLabel } from '@/lib/savings-labels'
import { cn } from '@/lib/utils'
import type { Movement } from '@/types/movement'

const ICONS: Record<string, React.ElementType> = {
  ShoppingCart, Banknote, Fuel, Pill, ArrowDownLeft, ArrowUpRight,
  Coffee, Bus, Utensils, Receipt, Tv, Wifi, Home, Music,
}

interface MovementItemProps {
  movement: Movement
  formattedTime: string
}

export function MovementItem({ movement, formattedTime }: MovementItemProps) {
  const Icon = ICONS[movement.iconName] ?? Receipt
  const isIncome = movement.type === 'income'
  const currencyBadge = currencyLabel(movement.currency, movement.cryptoSymbol)

  const isCrypto =
    movement.currency === 'CRYPTO' ||
    movement.savingsTarget === 'crypto' ||
    Boolean(movement.cryptoSymbol)

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          isIncome
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-zinc-800 text-zinc-400',
        )}
      >
        <Icon size={15} />
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
        <span className="truncate text-sm font-medium text-zinc-100 leading-tight">
          {movement.description}
        </span>
        <span className="text-xs text-zinc-500">{movement.category}</span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
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
        <span className="text-xs text-zinc-600">{formattedTime}</span>
      </div>
    </div>
  )
}
