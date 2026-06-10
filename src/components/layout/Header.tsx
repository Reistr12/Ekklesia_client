import { Menu } from 'lucide-react'

type HeaderProps = {
  title: string
  subtitle: string
  onToggleSidebar?: () => void
}

export function Header({ title, subtitle, onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-5 py-4 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

    </header>
  )
}
