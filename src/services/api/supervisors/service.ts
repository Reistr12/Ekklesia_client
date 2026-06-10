import { apiClient } from '../../axios/client'
import {
  normalizePaginationParams,
  toPaginatedResponse,
  type PaginatedResponse,
  type PaginationParams,
} from '../utils'
import type {
  CreateSupervisorPayload,
  CreateSupervisorResponse,
  SupervisorsData,
} from './types'

type ApiUser = {
  id: string
  name: string
  email: string
  phone: string
  role?: string
}

export const getSupervisorsData = async (
  params: PaginationParams = {},
): Promise<SupervisorsData> => {
  const pagination = normalizePaginationParams(params)
  const response = await apiClient.get<PaginatedResponse<ApiUser>>('/users', {
    params: pagination,
  })
  const paginated = toPaginatedResponse<ApiUser>(response.data, pagination)
  const users = paginated.data
  const people = users.filter((user) => ['SUPERVISOR', 'ADMIN'].includes(user.role?.toUpperCase() ?? ''))

  return {
    metrics: [
      { label: 'Pessoas administrativas', value: String(people.length), trend: 'Equipe de gestão' },
      {
        label: 'Administradores',
        value: String(people.filter((user) => user.role?.toUpperCase() === 'ADMIN').length),
        trend: 'Gestão principal',
      },
      { label: 'Usuários totais', value: String(paginated.total), trend: 'Base da igreja' },
    ],
    supervisors: people.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role?.toUpperCase() ?? 'SUPERVISOR',
    })),
    total: paginated.total,
    page: paginated.page,
    limit: paginated.limit,
    totalPages: paginated.totalPages,
  }
}

export const createSupervisor = async (
  payload: CreateSupervisorPayload,
): Promise<CreateSupervisorResponse> => {
  const response = await apiClient.post<CreateSupervisorResponse>('/users', payload)

  return response.data
}
