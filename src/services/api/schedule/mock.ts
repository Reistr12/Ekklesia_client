import type { ScheduleData } from './types'

export const getScheduleData = async (): Promise<ScheduleData> => {
  return {
    metrics: [
      { label: 'Compromissos semanais', value: '18', trend: '3 de alta prioridade' },
      { label: 'Reuniões de ministérios', value: '7', trend: '100% confirmadas' },
      { label: 'Pendências', value: '5', trend: '-2 desde ontem' },
    ],
    items: [
      { title: 'Planejamento de culto', date: '25/05/2026', time: '19:30', ministry: 'Louvor', priority: 'Alta' },
      { title: 'Reunião de recepção', date: '26/05/2026', time: '20:00', ministry: 'Boas-vindas', priority: 'Media' },
      { title: 'Ensaio geral', date: '28/05/2026', time: '19:00', ministry: 'Música', priority: 'Alta' },
    ],
  }
}
