'use client'

import { useEffect, useState } from 'react'
import { Smartphone, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase()
    setIsIos(/iphone|ipad|ipod/.test(ua))
    setInstalled(window.matchMedia('(display-mode: standalone)').matches)

    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setInstalled(true)
  }

  if (installed) {
    return (
      <p className="py-3 text-sm text-emerald-400">
        La app ya está instalada en este dispositivo.
      </p>
    )
  }

  if (deferredPrompt) {
    return (
      <div className="py-3">
        <p className="text-sm text-zinc-400">
          Instalá Linkeweb en tu pantalla de inicio para acceso rápido.
        </p>
        <button
          type="button"
          onClick={() => void handleInstall()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-zinc-950"
        >
          <Smartphone size={16} />
          Instalar app
        </button>
      </div>
    )
  }

  if (isIos) {
    return (
      <div className="py-3 text-sm text-zinc-400">
        <p className="flex items-start gap-2">
          <Share size={16} className="mt-0.5 shrink-0 text-zinc-500" />
          En Safari: tocá Compartir → &quot;Agregar a pantalla de inicio&quot;.
        </p>
        <p className="mt-2 text-xs text-zinc-600">
          Podés configurar la vista compacta en{' '}
          <a href="/resumen" className="text-emerald-400 hover:underline">
            /resumen
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <p className="py-3 text-sm text-zinc-500">
      Abrí la app en Chrome (Android) para ver la opción de instalar.
    </p>
  )
}
