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
          Es un acceso directo a la app, no un widget de la pantalla de inicio. Los números se ven
          al abrirla o en{' '}
          <Link href="/resumen" className="text-emerald-400 hover:underline">
            Resumen
          </Link>
          .
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
        Instalá {APP_NAME} como app en Android: ícono en el inicio y acceso rápido a{' '}
        <Link href="/resumen" className="text-emerald-400 hover:underline">
          Resumen
        </Link>
        . <strong className="text-zinc-300">No es un widget nativo</strong> — hay que abrir la app
        para ver los datos.
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

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-zinc-400">
        <p className="font-medium text-amber-200/90">Widget nativo (datos sin abrir la app)</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-zinc-500">
          <li>Configurá <code className="text-zinc-400">WIDGET_API_KEY</code> en Vercel y en <code className="text-zinc-400">android/gradle.properties</code></li>
          <li>Compilá la APK: <code className="text-zinc-400">pnpm cap:sync</code> → <code className="text-zinc-400">pnpm android:open</code></li>
          <li>Instalá la APK, iniciá sesión, agregá el widget 2×2 desde el inicio</li>
        </ol>
        <p className="mt-2 text-xs text-zinc-600">Guía completa en docs/WIDGET-ANDROID.md</p>
      </div>
    </div>
  )
}
