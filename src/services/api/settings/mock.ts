import type { SettingsData } from './types'

export const getSettingsData = async (): Promise<SettingsData> => {
  return {
    metrics: [
      { label: 'Usuários administrativos', value: '8', trend: '+1 nesta semana' },
      { label: 'Integrações ativas', value: '3', trend: 'Sem alterações' },
      { label: 'Backup automático', value: 'Ativo', trend: 'Último: hoje 03:00' },
    ],
    settings: [
      { module: 'Notificações', status: 'Ativo', updatedAt: '22/05/2026' },
      { module: 'Permissões de equipe', status: 'Ativo', updatedAt: '21/05/2026' },
      { module: 'Branding da igreja', status: 'Em revisão', updatedAt: '18/05/2026' },
    ],
    degraded: false,
    degradedSources: [],
  }
}
