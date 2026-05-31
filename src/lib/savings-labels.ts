import type { MovementCurrency, SavingsTarget } from '@/types/movement'

export function savingsTargetLabel(target: SavingsTarget, cryptoSymbol?: string): string {
  switch (target) {
    case 'ars':
      return 'Ahorro ARS'
    case 'usd':
      return 'Ahorro USD'
    case 'eur':
      return 'Ahorro EUR'
    case 'crypto':
      return cryptoSymbol ? `Ahorro ${cryptoSymbol.toUpperCase()}` : 'Ahorro cripto'
    default:
      return ''
  }
}

export function currencyLabel(currency: MovementCurrency, cryptoSymbol?: string): string {
  if (currency === 'CRYPTO') {
    return cryptoSymbol ? cryptoSymbol.toUpperCase() : 'Cripto'
  }
  return currency
}

export const SAVINGS_TARGET_OPTIONS = [
  { value: 'none', label: 'No, suma al presupuesto del mes' },
  { value: 'ars', label: 'Sí, ahorro en pesos (ARS)' },
  { value: 'usd', label: 'Sí, ahorro en dólares (USD)' },
  { value: 'eur', label: 'Sí, ahorro en euros (EUR)' },
  { value: 'crypto', label: 'Sí, ahorro en cripto' },
] as const

export const CURRENCY_OPTIONS = [
  { value: 'ARS', label: 'Pesos (ARS)' },
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'EUR', label: 'Euros (EUR)' },
  { value: 'CRYPTO', label: 'Criptomoneda' },
] as const
