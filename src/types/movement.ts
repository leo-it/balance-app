import type { EntityReminder } from '@/types/reminder'

export type MovementType = 'income' | 'expense'
export type MovementCurrency = 'ARS' | 'USD' | 'EUR' | 'CRYPTO'
export type SavingsTarget = 'none' | 'ars' | 'usd' | 'eur' | 'crypto'
export type MovementStatus = 'pending' | 'paid'

export interface Movement {
  id: string
  description: string
  amount: number
  type: MovementType
  category: string
  iconName: string
  currency: MovementCurrency
  cryptoSymbol?: string
  savingsTarget: SavingsTarget
  status: MovementStatus
  paidAt?: string
  createdAt: string
  reminder?: EntityReminder | null
}
