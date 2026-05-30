import { Wallet } from 'lucide-react'

interface MobileHeaderProps {
  userName?: string
  userInitial?: string
}

export function MobileHeader({ userName = 'Usuario', userInitial = 'U' }: MobileHeaderProps) {
  return (
    <header className="flex items-center justify-between lg:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
          <Wallet size={14} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 leading-none">Bienvenido</p>
          <h1 className="text-sm font-semibold text-zinc-100 leading-tight">{userName}</h1>
        </div>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 uppercase">
        {userInitial}
      </div>
    </header>
  )
}
