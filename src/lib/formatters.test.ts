import { describe, expect, it } from 'vitest'
import { formatMovementAmount } from './formatters'

describe('formatMovementAmount', () => {
  it('muestra decimales para cripto', () => {
    expect(formatMovementAmount(0.0001, 'CRYPTO', 'BTC')).toContain('0,0001')
    expect(formatMovementAmount(0.0001, 'CRYPTO', 'BTC')).toContain('BTC')
  })

  it('no redondea montos fraccionarios a $ 0 en ARS', () => {
    const formatted = formatMovementAmount(0.0001, 'ARS')
    expect(formatted).not.toBe('$ 0')
    expect(formatted).toContain('0,0001')
  })

  it('usa símbolo cripto con ahorro crypto aunque currency sea ARS', () => {
    expect(formatMovementAmount(0.5, 'ARS', 'ETH', 'crypto')).toContain('ETH')
  })
})
