import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  ShoppingCart,
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
]

export function navLabelForPath(pathname: string): string {
  const match = NAV_ITEMS.find((item) => item.href === pathname)
  return match?.label ?? 'Linkeweb'
}
