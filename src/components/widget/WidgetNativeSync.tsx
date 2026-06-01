'use client'

import { useEffect } from 'react'
import { configureNativeWidget } from '@/lib/capacitor/widget-config'

interface WidgetNativeSyncProps {
  userId: string
}

export function WidgetNativeSync({ userId }: WidgetNativeSyncProps) {
  useEffect(() => {
    void configureNativeWidget(userId)
  }, [userId])

  return null
}
