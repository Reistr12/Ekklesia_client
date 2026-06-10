import {
  Bell,
  BookOpen,
  CalendarFold,
  Church,
  Cog,
  DollarSign,
  HeartHandshake,
  LayoutDashboard,
  Lock,
  Megaphone,
  NotebookTabs,
  UserRound,
  Users,
} from 'lucide-react'
import type { SidebarGroupData, SidebarLink } from '../types/navigation'

export const churchGroup: SidebarGroupData = {
  key: 'minha-igreja',
  label: 'Minha Igreja',
  icon: Church,
  items: [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
      label: 'Cultos',
      path: '/cultos',
      icon: BookOpen,
      children: [
        { label: 'Programação de Cultos', path: '/cultos', icon: BookOpen },
        {
          label: 'Cultos Registrados',
          path: '/cultos-registrados',
          icon: NotebookTabs,
        },
      ],
    },
    {
      label: 'Agenda',
      path: '/agenda/ministerial',
      icon: CalendarFold,
      children: [
        { label: 'Agenda Ministerial', path: '/agenda/ministerial', icon: CalendarFold },
        { label: 'Agenda do Pastor', path: '/agenda/pastor', icon: CalendarFold },
      ],
    },
  ],
}

export const peopleGroup: SidebarGroupData = {
  key: 'pessoas',
  label: 'Pessoas',
  icon: Users,
  items: [
    { label: 'Membros', path: '/membros', icon: UserRound },
    { label: 'Cadastro de Pessoas', path: '/pessoas', icon: Users },
  ],
}

export const communicationGroup: SidebarGroupData = {
  key: 'comunicacao',
  label: 'Comunicação',
  icon: Megaphone,
  items: [
    { label: 'Avisos', path: '/avisos', icon: Bell },
    { label: 'Oração', path: '/oracao', icon: HeartHandshake },
  ],
}

export const groups = [churchGroup, peopleGroup, communicationGroup]

export const comingSoonModules: SidebarLink[] = [
  { label: 'Financeiro (em breve)', path: '/#', icon: DollarSign },
  { label: 'Presença (em breve)', path: '/#', icon: Users },
  { label: 'Células (em breve)', path: '/#', icon: Lock },
  { label: 'App do Membro (em breve)', path: '/#', icon: Lock },
]

export const settingsItem: SidebarLink = {
  label: 'Configurações',
  path: '/configuracoes',
  icon: Cog,
}
