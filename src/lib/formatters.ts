const LOCALE = 'es-AR'
const CURRENCY_ARS = 'ARS'
const CURRENCY_USD = 'USD'

export function formatCurrency(amount: number, currency: 'ARS' | 'USD' = 'ARS'): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: currency === 'USD' ? CURRENCY_USD : CURRENCY_ARS,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(amount)
}

export function formatCurrencyUsd(amount: number): string {
  return formatCurrency(amount, 'USD')
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
