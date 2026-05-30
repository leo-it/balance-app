export type MovementType = 'income' | 'expense'
export type MovementCurrency = 'ARS' | 'USD'
export type SavingsTarget = 'none' | 'ars' | 'usd'

export interface Movement {
  id: string
  description: string
  amount: number
  type: MovementType
  category: string
  iconName: string
  currency: MovementCurrency
  savingsTarget: SavingsTarget
  createdAt: string
}
