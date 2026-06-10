import type {
  CreateMemberPayload,
  CreateMemberResponse,
  MembersData,
  UpdateMemberPayload,
  UpdateMemberResponse,
} from './types'
import { normalizePaginationParams, type PaginationParams } from '../utils'

export const getMembersData = async (params: PaginationParams = {}): Promise<MembersData> => {
  const pagination = normalizePaginationParams(params)
  const allMembers = [
    { id: '1', name: 'Carlos Eduardo', phone: '(11) 90000-1111', dateOfBirth: '12/05/1991', dateOfBirthIso: '1991-05-12', contact: '(11) 90000-1111', status: 'Active' },
    { id: '2', name: 'Juliana Moraes', phone: '(11) 90000-2222', dateOfBirth: '02/09/1989', dateOfBirthIso: '1989-09-02', contact: '(11) 90000-2222', status: 'Active' },
    { id: '3', name: 'Felipe Rocha', phone: '(11) 90000-3333', dateOfBirth: '20/01/1998', dateOfBirthIso: '1998-01-20', contact: '(11) 90000-3333', status: 'New' },
  ]
  const start = (pagination.page - 1) * pagination.limit
  const paginatedMembers = allMembers.slice(start, start + pagination.limit)
  const total = allMembers.length

  return {
    metrics: [
      { label: 'Membros totais', value: '1.284', trend: '+48 no semestre' },
      { label: 'Novos convertidos', value: '72', trend: '+9 neste mês' },
      { label: 'Acompanhamentos', value: '134', trend: '82% concluídos' },
    ],
    members: paginatedMembers,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
  }
}

export const createMember = async (payload: CreateMemberPayload): Promise<CreateMemberResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: crypto.randomUUID(), ...payload }), 500)
  })
}

export const updateMember = async (id: string, payload: UpdateMemberPayload): Promise<UpdateMemberResponse> => {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          id,
          name: payload.name ?? 'Membro',
          phone: payload.phone,
          dateOfBirth: payload.dateOfBirth ?? '2000-01-01',
        }),
      500,
    )
  })
}

export const deleteMember = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500)
  })
}
