'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { AddExpenseSheet } from './AddExpenseSheet'

export function AddExpenseFab() {
  const [open, setOpen] = useState(false)
  const [sheetKey, setSheetKey] = useState(0)

  function handleOpen() {
    setSheetKey((k) => k + 1)
    setOpen(true)
  }

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={handleOpen}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25 lg:right-8"
        aria-label="Agregar gasto"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {open && (
        <AddExpenseSheet key={sheetKey} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
