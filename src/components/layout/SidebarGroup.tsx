import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { SidebarGroupData } from '../../types/navigation'
import { SidebarItem } from './SidebarItem'

type SidebarGroupProps = {
  group: SidebarGroupData
  isOpen: boolean
  onToggle: () => void
}

export function SidebarGroup({ group, isOpen, onToggle }: SidebarGroupProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-100 transition hover:border-white/20 hover:bg-white/10"
      >
        <span className="flex items-center gap-3 font-medium">
          <group.icon size={16} />
          {group.label}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-1 overflow-hidden pl-2"
          >
            {group.items.map((item) => (
              <SidebarItem key={item.path} item={item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
