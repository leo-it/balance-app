import type { EntityReminder } from '@/types/reminder'

export type ExpenseStatus = 'pending' | 'paid'

export interface FixedExpense {
  id: string
  label: string
  amount: number
  iconName: string
  status: ExpenseStatus
  paidAt?: string
  reminder?: EntityReminder | null
}
