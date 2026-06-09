import { Bell, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearAuthSession } from '../../utils/auth'

type HeaderProps = {
  title: string
  subtitle: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuthSession()
    navigate('/auth', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-5 py-4 backdrop-blur-md">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar"
            className="w-36 border-none bg-transparent outline-none placeholder:text-slate-400"
          />
        </label>
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
