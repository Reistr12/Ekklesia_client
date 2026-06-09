import { Church, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { comingSoonModules, groups, settingsItem } from '../../constants/sidebar'
import { getAuthContext } from '../../utils/auth'
import { SidebarGroup } from './SidebarGroup'
import { SidebarItem } from './SidebarItem'

export function Sidebar() {
  const initial = useMemo(() => groups[0]?.key ?? '', [])
  const [openGroup, setOpenGroup] = useState(initial)
  const authContext = getAuthContext()

  const visibleGroups = useMemo(() => {
    if (authContext?.role?.toUpperCase() !== 'SUPERVISOR') {
      return groups
    }

    return groups.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.path !== '/pessoas'),
    }))
  }, [authContext?.role])

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-80 flex-col border-r border-white/10 bg-brand-900 px-5 py-6">
      <div className="mb-7 rounded-2xl bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-600 p-2 text-white">
            <Church size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Ekklesia Platform</p>
            <p className="text-xs text-slate-400">Gestão para igrejas</p>
          </div>
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
      </div>
    </aside>
  )
}
