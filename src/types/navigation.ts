import type { LucideIcon } from 'lucide-react'

export type SidebarLink = {
  label: string
  path: string
  icon: LucideIcon
  children?: SidebarLink[]
}

export type SidebarGroupData = {
  key: string
  label: string
  icon: LucideIcon
  items: SidebarLink[]
}
