'use server'

import { revalidatePath } from 'next/cache'
import { getUserId } from '@/lib/auth'
import { assertDatabase } from '@/lib/env'
import { createDbClient, syncBudgetSnapshot } from '@/lib/db'
import { deleteReminderForEntity, syncReminderForEntity } from '@/lib/db/reminders'
import { formatCurrency } from '@/lib/formatters'
import { isReminderFormEnabled, parseReminderForm } from '@/lib/reminder-form'
import { sendToN8n } from '@/lib/n8n'
import type { FormActionState } from '@/types/form-action'

function parseAmount(raw: FormDataEntryValue | null): number | null {
  const normalized = String(raw ?? '').trim().replace(',', '.')
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return amount
}

export async function addFixedExpense(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  try {
    assertDatabase()
    const userId = await getUserId()
    const label = String(formData.get('label') ?? '').trim()
    const amount = parseAmount(formData.get('amount'))
    const iconName = String(formData.get('iconName') ?? 'Receipt').trim() || 'Receipt'

    if (!label) return { error: 'Ingresá un nombre para el gasto' }
    if (amount === null) return { error: 'Ingresá un monto válido mayor a 0' }

    const reminderInput = parseReminderForm(formData)
    if ('error' in reminderInput && reminderInput.error) {
      return { error: reminderInput.error }
    }

    const db = createDbClient()
    const { data, error } = await db
      .from('fixed_expenses')
      .insert({
        user_id: userId,
        label,
        amount,
        icon_name: iconName,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) return { error: error.message }

    if (isReminderFormEnabled(reminderInput)) {
      await syncReminderForEntity(
        userId,
        'fixed_expense',
        data.id,
        label,
        `Recordatorio: ${label} — ${formatCurrency(amount)}`,
        reminderInput,
      )
    } else {
      await syncReminderForEntity(
        userId,
        'fixed_expense',
        data.id,
        label,
        `Recordatorio: ${label} — ${formatCurrency(amount)}`,
        { enabled: false },
      )
    }

    await sendToN8n({
      userId,
      action: 'add_fixed_expense',
      payload: { label, amount, iconName },
    })

    revalidatePath('/')
    return { error: null, success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'No se pudo guardar el gasto' }
  }
}

export async function markAsPaid(expenseId: string): Promise<void> {
  assertDatabase()
  const userId = await getUserId()
  const paidAt = new Date().toISOString()
  const db = createDbClient()

  const { data: expense, error: fetchError } = await db
    .from('fixed_expenses')
    .select('amount, status')
    .eq('id', expenseId)
    .eq('user_id', userId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const { error: updateError } = await db
    .from('fixed_expenses')
    .update({ status: 'paid', paid_at: paidAt })
    .eq('id', expenseId)
    .eq('user_id', userId)

  if (updateError) throw new Error(updateError.message)

  await Promise.all([
    sendToN8n({ userId, action: 'mark_expense_paid', payload: { expenseId, paidAt } }),
    syncBudgetSnapshot(userId),
  ])

  revalidatePath('/')
  revalidatePath('/analytics')
  revalidatePath('/resumen')
}

export async function undoPaid(expenseId: string): Promise<void> {
  assertDatabase()
  const userId = await getUserId()
  const db = createDbClient()

  const { data: expense, error: fetchError } = await db
    .from('fixed_expenses')
    .select('amount, status')
    .eq('id', expenseId)
    .eq('user_id', userId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const { error: updateError } = await db
    .from('fixed_expenses')
    .update({ status: 'pending', paid_at: null })
    .eq('id', expenseId)
    .eq('user_id', userId)

  if (updateError) throw new Error(updateError.message)

  await Promise.all([
    sendToN8n({ userId, action: 'undo_expense_paid', payload: { expenseId } }),
    syncBudgetSnapshot(userId),
  ])

  revalidatePath('/')
  revalidatePath('/analytics')
  revalidatePath('/resumen')
}

export async function deleteFixedExpense(expenseId: string): Promise<void> {
  assertDatabase()
  const userId = await getUserId()
  const db = createDbClient()

  const { data, error: fetchError } = await db
    .from('fixed_expenses')
    .select('status')
    .eq('id', expenseId)
    .eq('user_id', userId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const { error } = await db
    .from('fixed_expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  await deleteReminderForEntity(userId, 'fixed_expense', expenseId)

  await Promise.all([
    sendToN8n({ userId, action: 'delete_fixed_expense', payload: { expenseId } }),
    data?.status === 'paid' ? syncBudgetSnapshot(userId) : Promise.resolve(),
  ])

  revalidatePath('/')
  revalidatePath('/analytics')
  revalidatePath('/resumen')
}

export async function updateFixedExpense(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  try {
    assertDatabase()
    const userId = await getUserId()
    const expenseId = String(formData.get('expenseId') ?? '').trim()
    const label = String(formData.get('label') ?? '').trim()
    const amount = parseAmount(formData.get('amount'))
    const iconName = String(formData.get('iconName') ?? 'Receipt').trim() || 'Receipt'

    if (!expenseId) return { error: 'Gasto no válido' }
    if (!label) return { error: 'Ingresá un nombre para el gasto' }
    if (amount === null) return { error: 'Ingresá un monto válido mayor a 0' }

    const reminderInput = parseReminderForm(formData)
    if ('error' in reminderInput && reminderInput.error) {
      return { error: reminderInput.error }
    }

    const db = createDbClient()
    const { data: existing, error: fetchError } = await db
      .from('fixed_expenses')
      .select('status')
      .eq('id', expenseId)
      .eq('user_id', userId)
      .single()

    if (fetchError) return { error: fetchError.message }

    const { error } = await db
      .from('fixed_expenses')
      .update({ label, amount, icon_name: iconName })
      .eq('id', expenseId)
      .eq('user_id', userId)

    if (error) return { error: error.message }

    if (isReminderFormEnabled(reminderInput)) {
      await syncReminderForEntity(
        userId,
        'fixed_expense',
        expenseId,
        label,
        `Recordatorio: ${label} — ${formatCurrency(amount)}`,
        reminderInput,
      )
    } else {
      await syncReminderForEntity(
        userId,
        'fixed_expense',
        expenseId,
        label,
        `Recordatorio: ${label} — ${formatCurrency(amount)}`,
        { enabled: false },
      )
    }

    await Promise.all([
      sendToN8n({
        userId,
        action: 'update_fixed_expense',
        payload: { expenseId, label, amount, iconName },
      }),
      existing?.status === 'paid' ? syncBudgetSnapshot(userId) : Promise.resolve(),
    ])

    revalidatePath('/')
    revalidatePath('/analytics')
    revalidatePath('/resumen')
    return { error: null, success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'No se pudo actualizar el gasto' }
  }
}
