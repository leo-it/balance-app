import { Capacitor, registerPlugin } from '@capacitor/core'

interface WidgetConfigPlugin {
  configure(options: { userId: string; apiBase?: string }): Promise<void>
}

const WidgetConfig = registerPlugin<WidgetConfigPlugin>('WidgetConfig')

export async function configureNativeWidget(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  const apiBase =
    typeof window !== 'undefined' &&
    !window.location.origin.includes('localhost') &&
    !window.location.origin.includes('127.0.0.1')
      ? window.location.origin
      : undefined

  await WidgetConfig.configure({ userId, apiBase })
}
