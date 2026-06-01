'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Smartphone } from 'lucide-react'

const DISMISS_KEY = 'linkeweb_install_banner_dismissed'

export function MobileInstallBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod/.test(ua)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = window.localStorage.getItem(DISMISS_KEY) === '1'

    setVisible(isMobile && !isStandalone && !dismissed)
  }, [])

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-3 lg:hidden">
      <div className="flex items-start gap-3">
        <Smartphone size={18} className="mt-0.5 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-emerald-100">Instalá Linkeweb en tu celular</p>
          <p className="mt-0.5 text-xs text-emerald-200/80">
            Acceso rápido desde el inicio y vista resumen tipo widget.
          </p>
          <Link
            href="/instalar"
            className="mt-2 inline-block text-sm font-semibold text-emerald-400 hover:underline"
          >
            Instalar ahora →
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-300/70 hover:bg-emerald-500/20"
          aria-label="Cerrar aviso"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
