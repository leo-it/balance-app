'use server'

import { revalidatePath } from 'next/cache'
import { getUserId } from '@/lib/auth'
import { assertDatabase } from '@/lib/env'
import {
  clearPurchasedShoppingListItems,
  deleteShoppingListItem,
  insertShoppingListItem,
  setShoppingListItemPurchased,
} from '@/lib/db/shopping-list'
import { sendToN8n } from '@/lib/n8n'
import type { FormActionState } from '@/types/form-action'

const CATEGORIES = ['General', 'Comida', 'Hogar', 'Limpieza', 'Otros'] as const

function parseCategory(raw: FormDataEntryValue | null): string {
  const value = String(raw ?? 'General').trim()
  if (CATEGORIES.includes(value as (typeof CATEGORIES)[number])) return value
  return 'General'
}

export async function addShoppingListItem(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  try {
    assertDatabase()
    const userId = await getUserId()
    const name = String(formData.get('name') ?? '').trim()
    const quantity = String(formData.get('quantity') ?? '').trim()
    const category = parseCategory(formData.get('category'))

    if (!name) return { error: 'Ingresá el nombre del ítem' }

    await insertShoppingListItem(userId, {
      name,
      category,
      ...(quantity ? { quantity } : {}),
    })

    await sendToN8n({
      userId,
      action: 'add_shopping_item',
      payload: { name, quantity: quantity || null, category },
    })

    revalidatePath('/compras')
    return { error: null, success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'No se pudo agregar el ítem' }
  }
}

export async function toggleShoppingListItemPurchased(
  itemId: string,
  purchased: boolean,
): Promise<void> {
  assertDatabase()
  const userId = await getUserId()
  await setShoppingListItemPurchased(userId, itemId, purchased)
  revalidatePath('/compras')
}

export async function removeShoppingListItem(itemId: string): Promise<void> {
  assertDatabase()
  const userId = await getUserId()
  await deleteShoppingListItem(userId, itemId)
  revalidatePath('/compras')
}

export async function clearPurchasedShoppingItems(): Promise<void> {
  assertDatabase()
  const userId = await getUserId()
  await clearPurchasedShoppingListItems(userId)
  revalidatePath('/compras')
}
