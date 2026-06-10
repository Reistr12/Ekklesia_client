import type { DashboardData } from './types'

export const getDashboardData = async (): Promise<DashboardData> => {
  return {
    metrics: [
      { label: 'Membros ativos', value: '1.284', trend: '+6.2% no mês' },
      { label: 'Visitantes do mês', value: '92', trend: '+14% no mês' },
      { label: 'Pedidos de oração', value: '37', trend: '+4 novos hoje' },
      { label: 'Eventos próximos', value: '9', trend: '+2 confirmados' },
    ],
    growth: [
      { month: 'Jan', value: 38 },
      { month: 'Fev', value: 42 },
      { month: 'Mar', value: 46 },
      { month: 'Abr', value: 48 },
      { month: 'Mai', value: 54 },
      { month: 'Jun', value: 58 },
    ],
    upcomingEvents: [
      {
        id: '1',
        title: 'Conferência Jovem',
        description: 'Conferência anual com ministrações e oficinas.',
        date: '28/05/2026',
        isoDate: '2026-05-28T19:00:00.000Z',
        owner: 'Ministério Jovem',
      },
      {
        id: '2',
        title: 'Treinamento de Líderes',
        description: 'Treinamento para líderes de células e ministérios.',
        date: '30/05/2026',
        isoDate: '2026-05-30T19:00:00.000Z',
        owner: 'Pr. Rafael',
      },
      {
        id: '3',
        title: 'Ação Social',
        description: 'Mobilização de voluntários para apoio comunitário.',
        date: '03/06/2026',
        isoDate: '2026-06-03T19:00:00.000Z',
        owner: 'Equipe Social',
      },
    ],
    prayerRequests: [
      { name: 'Marina', request: 'Saúde da família' },
      { name: 'João', request: 'Nova oportunidade de trabalho' },
      { name: 'Lívia', request: 'Fortalecimento espiritual' },
    ],
    activities: [
      { description: 'Novo membro cadastrado em Membros', time: '09:12' },
      { description: 'Aviso de reunião publicado', time: '10:45' },
      { description: 'Pedido de oração marcado como atendido', time: '11:33' },
    ],
    degraded: false,
    degradedSources: [],
  }
}
