'use client'

import { useActionState, useEffect, useOptimistic, useTransition } from 'react'
import { motion } from 'motion/react'
import { Check, ShoppingCart, Trash2 } from 'lucide-react'
import {
  addShoppingListItem,
  clearPurchasedShoppingItems,
  removeShoppingListItem,
  toggleShoppingListItemPurchased,
} from '@/actions/shopping-list.actions'
import type { FormActionState } from '@/types/form-action'
import type { ShoppingListItem } from '@/types/shopping-list'
import { cn } from '@/lib/utils'

const INITIAL: FormActionState = { error: null }

const CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'Comida', label: 'Comida' },
  { value: 'Hogar', label: 'Hogar' },
  { value: 'Limpieza', label: 'Limpieza' },
  { value: 'Otros', label: 'Otros' },
] as const

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30'

interface ShoppingListViewProps {
  items: ShoppingListItem[]
}

export function ShoppingListView({ items }: ShoppingListViewProps) {
  const [formState, formAction, formPending] = useActionState(addShoppingListItem, INITIAL)
  const [, startTransition] = useTransition()

  const [optimisticItems, applyOptimistic] = useOptimistic(
    items,
    (
      state: ShoppingListItem[],
      update:
        | { type: 'toggle'; id: string; purchased: boolean }
        | { type: 'delete'; id: string }
        | { type: 'clearPurchased' },
    ) => {
      if (update.type === 'delete') {
        return state.filter((item) => item.id !== update.id)
      }
      if (update.type === 'clearPurchased') {
        return state.filter((item) => !item.purchased)
      }
      return state.map((item) =>
        item.id === update.id ? { ...item, purchased: update.purchased } : item,
      )
    },
  )

  useEffect(() => {
    if (formState.success) {
      const form = document.getElementById('shopping-add-form') as HTMLFormElement | null
      form?.reset()
    }
  }, [formState.success])

  const pending = optimisticItems.filter((item) => !item.purchased)
  const purchased = optimisticItems.filter((item) => item.purchased)

  function handleToggle(id: string, purchased: boolean) {
    startTransition(async () => {
      applyOptimistic({ type: 'toggle', id, purchased })
      await toggleShoppingListItemPurchased(id, purchased)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: 'delete', id })
      await removeShoppingListItem(id)
    })
  }

  function handleClearPurchased() {
    startTransition(async () => {
      applyOptimistic({ type: 'clearPurchased' })
      await clearPurchasedShoppingItems()
    })
  }

  return (
    <div className="space-y-6">
      <form id="shopping-add-form" action={formAction} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-semibold text-zinc-300">Agregar ítem</h2>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Producto
          </label>
          <input
            id="name"
            name="name"
            placeholder="Ej. Leche, pan, detergente"
            className={inputClass}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="quantity" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Cantidad (opcional)
            </label>
            <input
              id="quantity"
              name="quantity"
              placeholder="Ej. 2 L"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="category" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Categoría
            </label>
            <select id="category" name="category" defaultValue="General" className={inputClass}>
              {CATEGORIES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <motion.button
          type="submit"
          disabled={formPending}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-50"
        >
          {formPending ? 'Agregando…' : 'Agregar a la lista'}
        </motion.button>
        {formState.error && (
          <p className="text-center text-sm text-red-500" role="alert">
            {formState.error}
          </p>
        )}
      </form>

      {optimisticItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center">
          <ShoppingCart size={28} className="mx-auto mb-3 text-zinc-600" />
          <p className="text-sm text-zinc-500">Tu lista está vacía. Agregá lo que necesitás comprar.</p>
        </div>
      ) : (
        <>
          <ItemSection title="Por comprar" count={pending.length}>
            {pending.length === 0 ? (
              <p className="text-sm text-zinc-500">Nada pendiente — ¡buen trabajo!</p>
            ) : (
              pending.map((item) => (
                <ShoppingRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))
            )}
          </ItemSection>

          {purchased.length > 0 && (
            <ItemSection
              title="Comprados"
              count={purchased.length}
              action={
                <button
                  type="button"
                  onClick={handleClearPurchased}
                  className="text-xs text-zinc-500 hover:text-red-400"
                >
                  Limpiar comprados
                </button>
              }
            >
              {purchased.map((item) => (
                <ShoppingRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </ItemSection>
          )}
        </>
      )}
    </div>
  )
}

function ItemSection({
  title,
  count,
  action,
  children,
}: {
  title: string
  count: number
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {title} ({count})
        </h2>
        {action}
      </div>
      <div className="divide-y divide-zinc-800/60 rounded-2xl border border-zinc-800 bg-zinc-900 px-4">
        {children}
      </div>
    </section>
  )
}

function ShoppingRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingListItem
  onToggle: (id: string, purchased: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <button
        type="button"
        onClick={() => onToggle(item.id, !item.purchased)}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors',
          item.purchased
            ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
            : 'border-zinc-600 bg-zinc-800 text-transparent hover:border-zinc-500',
        )}
        aria-label={item.purchased ? 'Marcar como pendiente' : 'Marcar como comprado'}
      >
        <Check size={14} />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium text-zinc-100',
            item.purchased && 'text-zinc-500 line-through',
          )}
        >
          {item.name}
        </p>
        <p className="text-xs text-zinc-500">
          {item.category}
          {item.quantity ? ` · ${item.quantity}` : ''}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
        aria-label="Borrar ítem"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
