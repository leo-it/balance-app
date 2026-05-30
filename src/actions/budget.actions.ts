'use server'

import { revalidatePath } from 'next/cache'
import { getUserId } from '@/lib/auth'
import { assertDatabase } from '@/lib/env'
import { updateBudgetConfig } from '@/lib/db'
import { sendToN8n } from '@/lib/n8n'
import type { FormActionState } from '@/types/form-action'

function parseAmount(raw: FormDataEntryValue | null): number | null {
  const normalized = String(raw ?? '').trim().replace(',', '.')
  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount < 0) return null
  return amount
}

export async function updateBudgetSettings(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  try {
    assertDatabase()
    const userId = await getUserId()

    const monthlyBudget = parseAmount(formData.get('monthlyBudget'))
    const savingsArsGoal = parseAmount(formData.get('savingsArsGoal'))
    const savingsArsCurrent = parseAmount(formData.get('savingsArsCurrent'))
    const savingsUsdGoal = parseAmount(formData.get('savingsUsdGoal'))
    const savingsUsdCurrent = parseAmount(formData.get('savingsUsdCurrent'))

    const patch: Parameters<typeof updateBudgetConfig>[1] = {}
    if (monthlyBudget !== null) patch.monthlyBudget = monthlyBudget
    if (savingsArsGoal !== null) patch.savingsArsGoal = savingsArsGoal
    if (savingsArsCurrent !== null) patch.savingsArsCurrent = savingsArsCurrent
    if (savingsUsdGoal !== null) patch.savingsUsdGoal = savingsUsdGoal
    if (savingsUsdCurrent !== null) patch.savingsUsdCurrent = savingsUsdCurrent

    if (Object.keys(patch).length === 0) {
      return { error: 'Completá al menos un campo' }
    }

    await updateBudgetConfig(userId, patch)

    await sendToN8n({ userId, action: 'update_budget', payload: patch as Record<string, unknown> })

    revalidatePath('/')
    revalidatePath('/settings')
    revalidatePath('/savings')
    revalidatePath('/analytics')
    revalidatePath('/resumen')
    return { error: null, success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'No se pudo guardar' }
  }
}
