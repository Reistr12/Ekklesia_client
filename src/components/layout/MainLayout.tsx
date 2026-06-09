import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Visão geral da sua igreja com dados em tempo real simulados.',
  },
  '/cultos': {
    title: 'Cultos',
    subtitle: 'Acompanhe agenda de cultos e indicadores de presença.',
  },
  '/eventos': {
    title: 'Eventos',
    subtitle: 'Organize os eventos da comunidade com clareza.',
  },
  '/agenda': {
    title: 'Agenda',
    subtitle: 'Planejamento semanal e próximos compromissos.',
  },
  '/cultos-registrados': {
    title: 'Cultos Registrados',
    subtitle: 'Histórico de cultos já realizados e registros consolidados.',
  },
  '/membros': {
    title: 'Membros',
    subtitle: 'Dados da membresia e status de acompanhamento.',
  },
  '/pessoas': {
    title: 'Cadastro de Pessoas',
    subtitle: 'Cadastro e gestão de administradores e supervisores da igreja.',
  },
  '/avisos': {
    title: 'Avisos',
    subtitle: 'Comunicados importantes para toda a igreja.',
  },
  '/oracao': {
    title: 'Oração',
    subtitle: 'Pedidos e acompanhamento de intercessão.',
  },
  '/configuracoes': {
    title: 'Configurações',
    subtitle: 'Personalize preferências da plataforma.',
  },
}

export function MainLayout() {
  const location = useLocation()
  const current =
    titles[location.pathname] ??
    titles['/']

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-0 min-h-screen p-4 md:ml-80 md:p-7">
        <Header title={current.title} subtitle={current.subtitle} />
        <Outlet />
      </main>
    </div>
  )
}
