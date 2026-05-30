'use server'

import { revalidatePath } from 'next/cache'
import { getUserId } from '@/lib/auth'
import { assertDatabase } from '@/lib/env'
import { applySavingsFromMovement, createDbClient, reverseSavingsFromMovement, syncBudgetSnapshot } from '@/lib/db'
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
  if (value === 'ars' || value === 'usd') return value
  return 'none'
}

function parseCurrency(raw: FormDataEntryValue | null): MovementCurrency {
  return String(raw ?? 'ARS') === 'USD' ? 'USD' : 'ARS'
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
    const currency = parseCurrency(formData.get('currency'))
    const savingsTarget = parseSavingsTarget(formData.get('savingsTarget'), type)

    if (!description) return { error: 'Ingresá una descripción' }
    if (amount === null) return { error: 'Ingresá un monto válido mayor a 0' }

    const movement = {
      user_id: userId,
      description,
      amount,
      type,
      category,
      icon_name: iconName,
      currency,
      savings_target: savingsTarget,
      created_at: new Date().toISOString(),
    }

    const db = createDbClient()
    const { error } = await db.from('movements').insert(movement)
    if (error) return { error: error.message }

    await Promise.all([
      sendToN8n({ userId, action: 'add_movement', payload: movement }),
      syncBudgetSnapshot(userId),
      applySavingsFromMovement(userId, amount, savingsTarget),
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

  const { data, error: fetchError } = await db
    .from('movements')
    .select('amount, savings_target')
    .eq('id', movementId)
    .eq('user_id', userId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const { error } = await db
    .from('movements')
    .delete()
    .eq('id', movementId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  const savingsTarget = (data?.savings_target ?? 'none') as SavingsTarget

  await Promise.all([
    sendToN8n({ userId, action: 'delete_movement', payload: { movementId } }),
    reverseSavingsFromMovement(userId, Number(data?.amount ?? 0), savingsTarget),
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
    const currency = parseCurrency(formData.get('currency'))
    const savingsTarget = parseSavingsTarget(formData.get('savingsTarget'), type)

    if (!movementId) return { error: 'Movimiento no válido' }
    if (!description) return { error: 'Ingresá una descripción' }
    if (amount === null) return { error: 'Ingresá un monto válido mayor a 0' }

    const db = createDbClient()
    const { data: existing, error: fetchError } = await db
      .from('movements')
      .select('amount, savings_target')
      .eq('id', movementId)
      .eq('user_id', userId)
      .single()

    if (fetchError) return { error: fetchError.message }

    const oldTarget = (existing?.savings_target ?? 'none') as SavingsTarget
    const oldAmount = Number(existing?.amount ?? 0)

    const { error } = await db
      .from('movements')
      .update({
        description,
        amount,
        type,
        category,
        icon_name: iconName,
        currency,
        savings_target: savingsTarget,
      })
      .eq('id', movementId)
      .eq('user_id', userId)

    if (error) return { error: error.message }

    await Promise.all([
      sendToN8n({
        userId,
        action: 'update_movement',
        payload: { movementId, description, amount, type, category },
      }),
      reverseSavingsFromMovement(userId, oldAmount, oldTarget),
      applySavingsFromMovement(userId, amount, savingsTarget),
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
