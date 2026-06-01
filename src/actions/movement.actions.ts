'use server'

import { revalidatePath } from 'next/cache'
import { getUserId } from '@/lib/auth'
import { assertDatabase } from '@/lib/env'
import {
  applySavingsFromMovement,
  createDbClient,
  fetchMovementRow,
  insertMovementRow,
  reverseSavingsFromMovement,
  syncBudgetSnapshot,
  updateMovementRow,
} from '@/lib/db'
import { deleteReminderForEntity, syncReminderForEntity } from '@/lib/db/reminders'
import { formatMovementAmount } from '@/lib/formatters'
import { isReminderFormEnabled, parseReminderForm } from '@/lib/reminder-form'
import { sendToN8n } from '@/lib/n8n'
import type { FormActionState } from '@/types/form-action'
import type { MovementCurrency, MovementType, SavingsTarget } from '@/types/movement'

function parseAmount(raw: FormDataEntryValue | null): number | null {
  const normalized = String(raw ?? '').trim().replace(',', '.')
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return amount
}

function parseSavingsTarget(raw: FormDataEntryValue | null, type: MovementType): SavingsTarget {
  if (type !== 'income') return 'none'
  const value = String(raw ?? 'none')
  if (value === 'ars' || value === 'usd' || value === 'eur' || value === 'crypto') return value
  return 'none'
}

function parseCurrency(raw: FormDataEntryValue | null): MovementCurrency {
  const value = String(raw ?? 'ARS')
  if (value === 'USD' || value === 'EUR' || value === 'CRYPTO') return value
  return 'ARS'
}

function parseCryptoSymbol(
  raw: FormDataEntryValue | null,
  currency: MovementCurrency,
  savingsTarget: SavingsTarget,
): string | undefined {
  const symbol = String(raw ?? '').trim().toUpperCase()
  const needsSymbol = currency === 'CRYPTO' || savingsTarget === 'crypto'
  if (!needsSymbol) return undefined
  if (!symbol) return undefined
  return symbol
}

function normalizeMovementCurrency(
  currency: MovementCurrency,
  savingsTarget: SavingsTarget,
  cryptoSymbol: string | undefined,
): MovementCurrency {
  if (savingsTarget === 'crypto' || currency === 'CRYPTO' || cryptoSymbol) {
    return 'CRYPTO'
  }
  return currency
}

function validateMovementMeta(
  currency: MovementCurrency,
  savingsTarget: SavingsTarget,
  cryptoSymbol: string | undefined,
): string | null {
  if (currency === 'CRYPTO' && !cryptoSymbol) {
    return 'Ingresá el símbolo de la cripto (ej. BTC, ETH, USDT)'
  }
  if (savingsTarget === 'crypto' && !cryptoSymbol) {
    return 'Ingresá el símbolo de la cripto para el ahorro'
  }
  return null
}

export async function addMovement(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  try {
    assertDatabase()
    const userId = await getUserId()
    const description = String(formData.get('description') ?? '').trim()
    const amount = parseAmount(formData.get('amount'))
    const category = String(formData.get('category') ?? 'General').trim() || 'General'
    const typeRaw = String(formData.get('type') ?? 'expense')
    const type: MovementType = typeRaw === 'income' ? 'income' : 'expense'
    const iconName = String(formData.get('iconName') ?? 'Receipt').trim() || 'Receipt'
    const savingsTarget = parseSavingsTarget(formData.get('savingsTarget'), type)
    const parsedCurrency = parseCurrency(formData.get('currency'))
    const cryptoSymbol = parseCryptoSymbol(
      formData.get('cryptoSymbol'),
      parsedCurrency,
      savingsTarget,
    )
    const currency = normalizeMovementCurrency(parsedCurrency, savingsTarget, cryptoSymbol)

    if (!description) return { error: 'Ingresá una descripción' }
    if (amount === null) return { error: 'Ingresá un monto válido mayor a 0' }

    const metaError = validateMovementMeta(currency, savingsTarget, cryptoSymbol)
    if (metaError) return { error: metaError }

    const reminderInput = parseReminderForm(formData)
    if ('error' in reminderInput && reminderInput.error) {
      return { error: reminderInput.error }
    }

    const createdAt = new Date().toISOString()
    const movement = {
      user_id: userId,
      description,
      amount,
      type,
      category,
      icon_name: iconName,
      currency,
      crypto_symbol: cryptoSymbol ?? null,
      savings_target: savingsTarget,
      created_at: createdAt,
    }

    const movementId = await insertMovementRow(userId, {
      description,
      amount,
      type,
      category,
      iconName,
      currency,
      cryptoSymbol,
      savingsTarget,
      createdAt,
    })

    if (isReminderFormEnabled(reminderInput)) {
      await syncReminderForEntity(
        userId,
        'movement',
        movementId,
        description,
        `Recordatorio: ${description} — ${formatMovementAmount(amount, currency, cryptoSymbol, savingsTarget)}`,
        reminderInput,
      )
    } else {
      await syncReminderForEntity(
        userId,
        'movement',
        movementId,
        description,
        `Recordatorio: ${description} — ${formatMovementAmount(amount, currency, cryptoSymbol, savingsTarget)}`,
        { enabled: false },
      )
    }

    await Promise.all([
      sendToN8n({ userId, action: 'add_movement', payload: movement }),
      syncBudgetSnapshot(userId),
      applySavingsFromMovement(userId, amount, savingsTarget, cryptoSymbol),
    ])

    revalidatePath('/')
    revalidatePath('/analytics')
    revalidatePath('/savings')
    revalidatePath('/resumen')
    return { error: null, success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'No se pudo guardar el movimiento' }
  }
}

export async function deleteMovement(movementId: string): Promise<void> {
  assertDatabase()
  const userId = await getUserId()
  const db = createDbClient()

  const existing = await fetchMovementRow(userId, movementId)
  const savingsTarget = (existing.savings_target ?? 'none') as SavingsTarget
  const cryptoSymbol = existing.crypto_symbol?.trim() || undefined

  const { error } = await db
    .from('movements')
    .delete()
    .eq('id', movementId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  await deleteReminderForEntity(userId, 'movement', movementId)

  await Promise.all([
    sendToN8n({ userId, action: 'delete_movement', payload: { movementId } }),
    reverseSavingsFromMovement(userId, Number(existing.amount ?? 0), savingsTarget, cryptoSymbol),
    syncBudgetSnapshot(userId),
  ])

  revalidatePath('/')
  revalidatePath('/analytics')
  revalidatePath('/savings')
  revalidatePath('/resumen')
}

export async function updateMovement(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  try {
    assertDatabase()
    const userId = await getUserId()
    const movementId = String(formData.get('movementId') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const amount = parseAmount(formData.get('amount'))
    const category = String(formData.get('category') ?? 'General').trim() || 'General'
    const typeRaw = String(formData.get('type') ?? 'expense')
    const type: MovementType = typeRaw === 'income' ? 'income' : 'expense'
    const iconName = String(formData.get('iconName') ?? 'Receipt').trim() || 'Receipt'
    const savingsTarget = parseSavingsTarget(formData.get('savingsTarget'), type)
    const parsedCurrency = parseCurrency(formData.get('currency'))
    const cryptoSymbol = parseCryptoSymbol(
      formData.get('cryptoSymbol'),
      parsedCurrency,
      savingsTarget,
    )
    const currency = normalizeMovementCurrency(parsedCurrency, savingsTarget, cryptoSymbol)

    if (!movementId) return { error: 'Movimiento no válido' }
    if (!description) return { error: 'Ingresá una descripción' }
    if (amount === null) return { error: 'Ingresá un monto válido mayor a 0' }

    const metaError = validateMovementMeta(currency, savingsTarget, cryptoSymbol)
    if (metaError) return { error: metaError }

    const reminderInput = parseReminderForm(formData)
    if ('error' in reminderInput && reminderInput.error) {
      return { error: reminderInput.error }
    }

    const existing = await fetchMovementRow(userId, movementId)
    const oldTarget = (existing.savings_target ?? 'none') as SavingsTarget
    const oldAmount = Number(existing.amount ?? 0)
    const oldCryptoSymbol = existing.crypto_symbol?.trim() || undefined

    await updateMovementRow(userId, movementId, {
      description,
      amount,
      type,
      category,
      iconName,
      currency,
      cryptoSymbol,
      savingsTarget,
    })

    if (isReminderFormEnabled(reminderInput)) {
      await syncReminderForEntity(
        userId,
        'movement',
        movementId,
        description,
        `Recordatorio: ${description} — ${formatMovementAmount(amount, currency, cryptoSymbol, savingsTarget)}`,
        reminderInput,
      )
    } else {
      await syncReminderForEntity(
        userId,
        'movement',
        movementId,
        description,
        `Recordatorio: ${description} — ${formatMovementAmount(amount, currency, cryptoSymbol, savingsTarget)}`,
        { enabled: false },
      )
    }

    await Promise.all([
      sendToN8n({
        userId,
        action: 'update_movement',
        payload: { movementId, description, amount, type, category },
      }),
      reverseSavingsFromMovement(userId, oldAmount, oldTarget, oldCryptoSymbol),
      applySavingsFromMovement(userId, amount, savingsTarget, cryptoSymbol),
      syncBudgetSnapshot(userId),
    ])

    revalidatePath('/')
    revalidatePath('/analytics')
    revalidatePath('/savings')
    revalidatePath('/resumen')
    return { error: null, success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'No se pudo actualizar el movimiento' }
  }
}
