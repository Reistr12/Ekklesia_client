import { apiClient } from '../../axios/client'
import { toArray } from '../utils'
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

export const getSupervisorsData = async (): Promise<SupervisorsData> => {
  const response = await apiClient.get<ApiUser[]>('/users')
  const users = toArray<ApiUser>(response.data)
  const people = users.filter((user) => ['SUPERVISOR', 'ADMIN'].includes(user.role?.toUpperCase() ?? ''))

  return {
    metrics: [
      { label: 'Pessoas administrativas', value: String(people.length), trend: 'Equipe de gestão' },
      {
        label: 'Administradores',
        value: String(people.filter((user) => user.role?.toUpperCase() === 'ADMIN').length),
        trend: 'Gestão principal',
      },
      { label: 'Usuários totais', value: String(users.length), trend: 'Base da igreja' },
    ],
    supervisors: people.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role?.toUpperCase() ?? 'SUPERVISOR',
    })),
  }
}

export const createSupervisor = async (
  payload: CreateSupervisorPayload,
): Promise<CreateSupervisorResponse> => {
  const response = await apiClient.post<CreateSupervisorResponse>('/users', payload)

  return response.data
}
