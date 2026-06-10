import { Church, LogOut, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { comingSoonModules, groups, settingsItem } from '../../constants/sidebar'
import { clearAuthSession, getAuthContext } from '../../utils/auth'
import { SidebarGroup } from './SidebarGroup'
import { SidebarItem } from './SidebarItem'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const initial = useMemo(() => groups[0]?.key ?? '', [])
  const [openGroup, setOpenGroup] = useState(initial)
  const authContext = getAuthContext()

  const handleLogout = () => {
    clearAuthSession()
    navigate('/auth', { replace: true })
  }

  const visibleGroups = useMemo(() => {
    if (authContext?.role?.toUpperCase() !== 'SUPERVISOR') {
      return groups
    }

    return groups.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.path !== '/pessoas'),
    }))
  }, [authContext?.role])

  const content = (
    <>
      <div className="mb-7 rounded-2xl bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-600 p-2 text-white">
              <Church size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Ekklesia Platform</p>
              <p className="text-xs text-slate-400">Gestão para igrejas</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto pr-1">
        {visibleGroups.map((group) => (
          <SidebarGroup
            key={group.key}
            group={group}
            isOpen={openGroup === group.key}
            onToggle={() => setOpenGroup((state) => (state === group.key ? '' : group.key))}
          />
        ))}

        <div className="pt-4">
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
            <Sparkles size={12} />
            Módulos
          </p>
          <div className="space-y-1">
            {comingSoonModules.map((module) => (
              <SidebarItem key={module.label} item={module} disabled />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-white/10 pt-4">
        <SidebarItem item={settingsItem} />
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-200 transition-all hover:bg-brand-700/40 hover:text-white"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-80 flex-col border-r border-white/10 bg-brand-900 px-5 py-6 lg:flex">
        {content}
      </aside>

      <div className={`fixed inset-0 z-40 transition lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-slate-900/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />

        <aside
          className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-white/10 bg-brand-900 px-5 py-6 shadow-2xl transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {content}
        </aside>
      </div>
    </>
  )
}
