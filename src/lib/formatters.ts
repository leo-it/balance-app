import type { MovementCurrency, SavingsTarget } from '@/types/movement'

const LOCALE = 'es-AR'

type FiatCurrency = 'ARS' | 'USD' | 'EUR'

function isCryptoMovement(
  currency: MovementCurrency,
  savingsTarget: SavingsTarget,
  cryptoSymbol?: string,
): boolean {
  return (
    currency === 'CRYPTO' ||
    savingsTarget === 'crypto' ||
    Boolean(cryptoSymbol?.trim())
  )
}

export function formatCurrency(amount: number, currency: FiatCurrency = 'ARS'): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'ARS' ? 0 : 2,
  }).format(amount)
}

export function formatCurrencyUsd(amount: number): string {
  return formatCurrency(amount, 'USD')
}

export function formatCryptoAmount(amount: number, symbol = 'CRIPTO'): string {
  const formatted = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }).format(amount)
  return `${formatted} ${symbol.toUpperCase()}`
}

export function formatMovementAmount(
  amount: number,
  currency: MovementCurrency,
  cryptoSymbol?: string,
  savingsTarget: SavingsTarget = 'none',
): string {
  if (isCryptoMovement(currency, savingsTarget, cryptoSymbol)) {
    return formatCryptoAmount(amount, cryptoSymbol ?? 'CRIPTO')
  }
  if (currency === 'USD' || currency === 'EUR') {
    return formatCurrency(amount, currency)
  }
  // ARS usa 0 decimales: montos < $1 (ej. 0,0001 BTC) desaparecen como "$ 0"
  if (amount > 0 && amount < 1) {
    return formatCryptoAmount(amount, cryptoSymbol ?? 'CRIPTO')
  }
  return formatCurrency(amount, 'ARS')
}

export function formatTime(isoString: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(isoString))
}

export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(isoString))
}

export function savingsPercent(current: number, goal: number): number {
  if (goal <= 0) return 0
  return Math.min(Math.round((current / goal) * 100), 100)
}
