import { getUserId } from '@/lib/auth'
import { assertDatabase } from '@/lib/env'
import { getShoppingListItems, isShoppingListReady } from '@/lib/db/shopping-list'
import { ShoppingListView } from '@/components/shopping/ShoppingListView'

export default async function ComprasPage() {
  assertDatabase()

  const ready = await isShoppingListReady()
  if (!ready) {
    return (
      <div className="px-4 py-5 lg:px-8 lg:py-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-zinc-100">Lista de compras</h1>
          <p className="text-sm text-zinc-500">Organizá lo que tenés que comprar</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
          Falta la tabla de lista de compras. Ejecutá{' '}
          <code className="text-amber-100">006_shopping_list.sql</code> en el SQL Editor de
          Supabase y recargá la página.
        </div>
      </div>
    )
  }

  const userId = await getUserId()
  const items = await getShoppingListItems(userId)

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6">
      <div className="mb-6 lg:hidden">
        <p className="text-sm text-zinc-500">Organizá lo que tenés que comprar</p>
      </div>
      <div className="mb-6 hidden lg:block">
        <h1 className="text-lg font-semibold text-zinc-100">Lista de compras</h1>
        <p className="text-sm text-zinc-500">Organizá lo que tenés que comprar</p>
      </div>
      <ShoppingListView items={items} />
    </div>
  )
}
