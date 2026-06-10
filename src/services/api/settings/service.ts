import { apiClient } from '../../axios/client'
import type { SettingsData } from './types'
import { formatDate, toPaginatedResponse } from '../utils'

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
    apiClient.get('/users', { params: { page: 1, limit: 100 } }),
  ])

  const churchProfile = profileResult.status === 'fulfilled' ? profileResult.value.data : null
  const usersPaginated =
    usersResult.status === 'fulfilled'
      ? toPaginatedResponse<ApiUser>(usersResult.value.data, { page: 1, limit: 100 })
      : { data: [], total: 0, page: 1, limit: 100, totalPages: 1 }
  const users = usersPaginated.data
  const adminUsers = users.filter((user) => user.role?.toUpperCase() === 'ADMIN').length
  const degradedSources = [
    profileResult.status === 'rejected' ? 'perfil da igreja' : null,
    usersResult.status === 'rejected' ? 'usuários' : null,
  ].filter((value): value is string => value !== null)

  return {
    metrics: [
      { label: 'Usuários administrativos', value: String(adminUsers), trend: 'Controle de acesso' },
      { label: 'Usuários totais', value: String(usersPaginated.total), trend: 'Equipe cadastrada' },
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
