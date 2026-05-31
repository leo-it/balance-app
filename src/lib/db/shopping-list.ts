import { createDbClient } from './client'
import { isMissingTableError } from './health'
import type { ShoppingListItem } from '@/types/shopping-list'

interface ShoppingListRow {
  id: string
  user_id: string
  name: string
  quantity: string | null
  category: string
  purchased: boolean
  created_at: string
}

function toShoppingListItem(row: ShoppingListRow): ShoppingListItem {
  const quantity = row.quantity?.trim()
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    purchased: row.purchased,
    createdAt: row.created_at,
    ...(quantity ? { quantity } : {}),
  }
}

export async function isShoppingListReady(): Promise<boolean> {
  const db = createDbClient()
  const { error } = await db.from('shopping_list_items').select('id').limit(1)

  if (!error) return true
  if (isMissingTableError(error.message)) return false
  throw new Error(error.message)
}

export async function getShoppingListItems(userId: string): Promise<ShoppingListItem[]> {
  const db = createDbClient()
  const { data, error } = await db
    .from('shopping_list_items')
    .select('*')
    .eq('user_id', userId)
    .order('purchased', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data) return []
  return (data as ShoppingListRow[]).map(toShoppingListItem)
}

export async function insertShoppingListItem(
  userId: string,
  input: { name: string; quantity?: string; category: string },
): Promise<void> {
  const db = createDbClient()
  const { error } = await db.from('shopping_list_items').insert({
    user_id: userId,
    name: input.name,
    quantity: input.quantity ?? null,
    category: input.category,
    purchased: false,
  })

  if (error) throw new Error(error.message)
}

export async function setShoppingListItemPurchased(
  userId: string,
  itemId: string,
  purchased: boolean,
): Promise<void> {
  const db = createDbClient()
  const { error } = await db
    .from('shopping_list_items')
    .update({ purchased })
    .eq('id', itemId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function deleteShoppingListItem(userId: string, itemId: string): Promise<void> {
  const db = createDbClient()
  const { error } = await db
    .from('shopping_list_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function clearPurchasedShoppingListItems(userId: string): Promise<void> {
  const db = createDbClient()
  const { error } = await db
    .from('shopping_list_items')
    .delete()
    .eq('user_id', userId)
    .eq('purchased', true)

  if (error) throw new Error(error.message)
}
