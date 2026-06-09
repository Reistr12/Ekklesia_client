import { apiClient } from '../../axios/client'
import type {
  CreateMemberPayload,
  CreateMemberResponse,
  MembersData,
  UpdateMemberPayload,
  UpdateMemberResponse,
} from './types'
import { formatDate } from '../utils'
import { toArray } from '../utils'

type ApiMember = {
  id: string
  name: string
  phone?: string
  dateOfBirth: string
  createdAt?: string
}

export const getMembersData = async (): Promise<MembersData> => {
  const response = await apiClient.get<ApiMember[]>('/members')
  const members = toArray<ApiMember>(response.data)
  const now = Date.now()
  const thisMonth = members.filter((item) => {
    if (!item.createdAt) {
      return false
    }

    const createdAt = new Date(item.createdAt)
    return createdAt.getMonth() === new Date(now).getMonth() && createdAt.getFullYear() === new Date(now).getFullYear()
  }).length

  return {
    metrics: [
      { label: 'Membros totais', value: String(members.length), trend: 'Base ativa da igreja' },
      { label: 'Novos no mês', value: String(thisMonth), trend: 'Crescimento atual' },
      { label: 'Com contato', value: String(members.filter((item) => Boolean(item.phone)).length), trend: 'Cadastro atualizado' },
    ],
    members: members.map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone ?? '-',
      dateOfBirth: formatDate(item.dateOfBirth),
      dateOfBirthIso: item.dateOfBirth,
      contact: item.phone ?? '-',
      status: item.createdAt && now - new Date(item.createdAt).getTime() < 1000 * 60 * 60 * 24 * 30 ? 'New' : 'Active',
    })),
  }
}

export const createMember = async (payload: CreateMemberPayload): Promise<CreateMemberResponse> => {
  const response = await apiClient.post<CreateMemberResponse>('/members', payload)
  return response.data
}

export const updateMember = async (id: string, payload: UpdateMemberPayload): Promise<UpdateMemberResponse> => {
  const response = await apiClient.patch<UpdateMemberResponse>(`/members/${id}`, payload)
  return response.data
}

export const deleteMember = async (id: string): Promise<void> => {
  await apiClient.delete(`/members/${id}`)
}
