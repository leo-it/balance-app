interface DesktopHeaderProps {
  userName?: string
  userInitial?: string
}

export function DesktopHeader({ userName = 'Usuario', userInitial = 'U' }: DesktopHeaderProps) {
  return (
    <header className="hidden h-16 items-center justify-between border-b border-zinc-800 px-8 lg:flex">
      <div>
        <h1 className="text-base font-semibold text-zinc-100">Dashboard</h1>
        <p className="text-xs text-zinc-500">Bienvenido, {userName}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 uppercase">
          {userInitial}
        </div>
      </div>
    </header>
  )
}
