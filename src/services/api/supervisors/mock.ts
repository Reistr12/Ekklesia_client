import type {
  CreateSupervisorPayload,
  CreateSupervisorResponse,
  SupervisorsData,
} from './types'
import { normalizePaginationParams, type PaginationParams } from '../utils'

export const getSupervisorsData = async (params: PaginationParams = {}): Promise<SupervisorsData> => {
  const pagination = normalizePaginationParams(params)
  const allSupervisors = [
    {
      id: '0',
      name: 'Gabriel Reis',
      email: 'gabriel.reis@ekklesia.com',
      phone: '(11) 98888-0000',
      role: 'ADMIN',
    },
    {
      id: '1',
      name: 'Mariana Alves',
      email: 'mariana.alves@ekklesia.com',
      phone: '(11) 98888-1111',
      role: 'SUPERVISOR',
    },
    {
      id: '2',
      name: 'Rafael Lima',
      email: 'rafael.lima@ekklesia.com',
      phone: '(11) 98888-2222',
      role: 'SUPERVISOR',
    },
    {
      id: '3',
      name: 'Juliana Costa',
      email: 'juliana.costa@ekklesia.com',
      phone: '(11) 98888-3333',
      role: 'SUPERVISOR',
    },
  ]
  const start = (pagination.page - 1) * pagination.limit
  const paginatedSupervisors = allSupervisors.slice(start, start + pagination.limit)
  const total = allSupervisors.length

  return {
    metrics: [
      { label: 'Pessoas administrativas', value: '4', trend: 'Equipe de gestão' },
      { label: 'Administradores', value: '1', trend: 'Gestão principal' },
      { label: 'Usuários totais', value: '18', trend: 'Base da igreja' },
    ],
    supervisors: paginatedSupervisors,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
  }
}

export const createSupervisor = async (
  payload: CreateSupervisorPayload,
): Promise<CreateSupervisorResponse> => {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          id: crypto.randomUUID(),
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: payload.role,
        }),
      500,
    )
  })
}
