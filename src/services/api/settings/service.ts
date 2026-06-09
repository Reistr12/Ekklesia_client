import { apiClient } from '../../axios/client'
import type { SettingsData } from './types'
import { formatDate, toArray } from '../utils'

type ApiChurchProfile = {
  id: string
  name: string
  updatedAt?: string
}

type ApiUser = {
  id: string
  role?: string
}

export const getSettingsData = async (): Promise<SettingsData> => {
  const [profileResult, usersResult] = await Promise.allSettled([
    apiClient.get<ApiChurchProfile>('/church-profile'),
    apiClient.get<ApiUser[]>('/users'),
  ])

  const churchProfile = profileResult.status === 'fulfilled' ? profileResult.value.data : null
  const users = usersResult.status === 'fulfilled' ? toArray<ApiUser>(usersResult.value.data) : []
  const adminUsers = users.filter((user) => user.role?.toUpperCase() === 'ADMIN').length
  const degradedSources = [
    profileResult.status === 'rejected' ? 'perfil da igreja' : null,
    usersResult.status === 'rejected' ? 'usuários' : null,
  ].filter((value): value is string => value !== null)

  return {
    metrics: [
      { label: 'Usuários administrativos', value: String(adminUsers), trend: 'Controle de acesso' },
      { label: 'Usuários totais', value: String(users.length), trend: 'Equipe cadastrada' },
      { label: 'Perfil da igreja', value: churchProfile?.name ?? 'Não configurado', trend: 'Dados institucionais' },
    ],
    settings: [
      {
        module: 'Perfil da igreja',
        status: churchProfile ? 'Ativo' : 'Pendente',
        updatedAt: formatDate(churchProfile?.updatedAt),
      },
      {
        module: 'Usuários e permissões',
        status: users.length > 0 ? 'Ativo' : 'Pendente',
        updatedAt: formatDate(new Date()),
      },
    ],
    degraded: degradedSources.length > 0,
    degradedSources,
  }
}
