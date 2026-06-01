import type { LucideIcon } from 'lucide-react'
import { APP_NAME } from '@/lib/app-config'
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Wallet,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/resumen', label: 'Resumen', icon: Wallet },
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/compras', label: 'Compras', icon: ShoppingCart },
  { href: '/analytics', label: 'Análisis', icon: BarChart3 },
  { href: '/savings', label: 'Ahorros', icon: TrendingUp },
  { href: '/settings', label: 'Ajustes', icon: Settings },
  { href: '/instalar', label: 'Instalar', icon: Smartphone },
]

export function navLabelForPath(pathname: string): string {
  const match = NAV_ITEMS.find((item) => item.href === pathname)
  return match?.label ?? APP_NAME
}
