import type { MovementCurrency, SavingsTarget } from '@/types/movement'

export function movementAmountStep(
  currency: MovementCurrency,
  savingsTarget: SavingsTarget = 'none',
): string {
  if (currency === 'CRYPTO' || savingsTarget === 'crypto') {
    return 'any'
  }
  return '0.01'
}
