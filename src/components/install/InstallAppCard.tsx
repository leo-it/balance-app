'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, Smartphone, Share } from 'lucide-react'
import { APP_NAME } from '@/lib/app-config'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectPlatform() {
  if (typeof window === 'undefined') {
    return { isAndroid: false, isIos: false, isStandalone: false }
  }
  const ua = window.navigator.userAgent.toLowerCase()
  return {
    isAndroid: /android/.test(ua),
    isIos: /iphone|ipad|ipod/.test(ua),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
  }
}

export function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [platform, setPlatform] = useState({
    isAndroid: false,
    isIos: false,
    isStandalone: false,
  })

  useEffect(() => {
    setPlatform(detectPlatform())

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
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') {
      setPlatform((prev) => ({ ...prev, isStandalone: true }))
    }
  }

  if (platform.isStandalone) {
    return (
      <div className="space-y-3 py-1">
        <p className="text-sm text-emerald-400">{APP_NAME} ya está en tu pantalla de inicio.</p>
        <p className="text-xs text-zinc-500">
          Mantené presionado el ícono → <strong className="text-zinc-400">Resumen rápido</strong>{' '}
          para ver disponible hoy sin abrir toda la app.
        </p>
        <Link
          href="/resumen"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:underline"
        >
          <LayoutGrid size={16} />
          Abrir vista resumen
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 py-1">
      <p className="text-sm text-zinc-400">
        Instalá {APP_NAME} como app en Android. Es el MVP del &quot;widget&quot;: acceso directo desde
        el inicio y vista compacta en{' '}
        <Link href="/resumen" className="text-emerald-400 hover:underline">
          Resumen
        </Link>
        .
      </p>

      {deferredPrompt && (
        <button
          type="button"
          onClick={() => void handleInstall()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-zinc-950"
        >
          <Smartphone size={18} />
          Instalar en este celular
        </button>
      )}

      {platform.isAndroid && !deferredPrompt && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-sm text-zinc-400">
          <p className="font-medium text-zinc-300">Si no ves el botón verde:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs">
            <li>Abrí esta página en <strong className="text-zinc-300">Chrome</strong> (no Instagram ni Gmail).</li>
            <li>Menú ⋮ → <strong className="text-zinc-300">Instalar aplicación</strong> o &quot;Agregar a pantalla de inicio&quot;.</li>
          </ol>
        </div>
      )}

      {platform.isIos && (
        <div className="flex items-start gap-2 text-sm text-zinc-400">
          <Share size={16} className="mt-0.5 shrink-0 text-zinc-500" />
          <p>
            En Safari: Compartir → <strong className="text-zinc-300">Agregar a pantalla de inicio</strong>.
          </p>
        </div>
      )}

      {!platform.isAndroid && !platform.isIos && !deferredPrompt && (
        <p className="text-sm text-zinc-500">
          Abrí {APP_NAME} en Chrome en tu Android para instalar con un toque.
        </p>
      )}

      <p className="text-xs text-zinc-600">
        El widget nativo 2×2 (sin abrir la app) requiere la APK Android — próxima fase.
      </p>
    </div>
  )
}
