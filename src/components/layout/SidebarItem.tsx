import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { SidebarLink } from '../../types/navigation'

type SidebarItemProps = {
  item: SidebarLink
  compact?: boolean
  disabled?: boolean
}

export function SidebarItem({ item, compact = false, disabled = false }: SidebarItemProps) {
  const location = useLocation()
  const hasChildren = Boolean(item.children && item.children.length > 0)

  const hasActiveChild = useMemo(() => {
    if (!item.children) {
      return false
    }

    return item.children.some((child) => location.pathname === child.path)
  }, [item.children, location.pathname])

  const [isOpen, setIsOpen] = useState(hasActiveChild)
  const isActive = location.pathname === item.path || hasActiveChild

  if (disabled) {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400">
        <item.icon size={16} />
        {!compact && <span>{item.label}</span>}
      </div>
    )
  }

  if (hasChildren && item.children) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setIsOpen((state) => !state)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
            isActive
              ? 'bg-brand-600 text-white shadow-soft'
              : 'text-slate-200 hover:bg-brand-700/40 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-3">
            <item.icon size={16} />
            {!compact && <span>{item.label}</span>}
          </span>
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen ? (
          <div className="mt-1 space-y-1 pl-7">
            {item.children.map((child) => (
              <SidebarItem key={child.path} item={child} compact={compact} />
            ))}
          </div>
        ) : null}
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
