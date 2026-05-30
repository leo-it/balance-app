import type { Metadata, Viewport } from 'next'
import { hasValidClerkKey } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'Linkeweb — Gestor de Gastos',
  description: 'Gestor de gastos y ahorros inteligente',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Linkeweb',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (hasValidClerkKey) {
    const { ClerkProvider } = await import('@clerk/nextjs')
    return (
      <ClerkProvider>
        <html lang="es" className="dark" style={{ colorScheme: 'dark' }}>
          <body className="bg-zinc-950 text-zinc-50 antialiased">{children}</body>
        </html>
      </ClerkProvider>
    )
  }

  return (
    <html lang="es" className="dark" style={{ colorScheme: 'dark' }}>
      <body className="bg-zinc-950 text-zinc-50 antialiased">{children}</body>
    </html>
  )
}
