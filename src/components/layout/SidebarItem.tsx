import { Link, useLocation } from 'react-router-dom'
import type { SidebarLink } from '../../types/navigation'

type SidebarItemProps = {
  item: SidebarLink
  compact?: boolean
  disabled?: boolean
}

export function SidebarItem({ item, compact = false, disabled = false }: SidebarItemProps) {
  const location = useLocation()
  const isActive = location.pathname === item.path

  if (disabled) {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400">
        <item.icon size={16} />
        {!compact && <span>{item.label}</span>}
      </div>
    )
  }

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
        isActive
          ? 'bg-brand-600 text-white shadow-soft'
          : 'text-slate-200 hover:bg-brand-700/40 hover:text-white'
      }`}
    >
      <item.icon size={16} />
      {!compact && <span>{item.label}</span>}
    </Link>
  )
}
