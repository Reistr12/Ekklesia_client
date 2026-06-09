import { apiClient } from '../../axios/client'
import type {
  CreateChurchServicePayload,
  CreateChurchServiceResponse,
  ChurchServicesData,
  UpdateChurchServicePayload,
  UpdateChurchServiceResponse,
} from './types'
import { toArray } from '../utils'

type ApiChurchService = {
  id: string
  title: string
  description: string
  day: string
  startsAt: string
  endsAt: string
  isOnline: boolean
  streamUrl?: string | null
}

const dayLabels: Record<string, string> = {
  SUNDAY: 'Domingo',
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
}

export const getChurchServicesData = async (): Promise<ChurchServicesData> => {
  const response = await apiClient.get<ApiChurchService[]>('/church-services')
  const churchServices = toArray<ApiChurchService>(response.data)

  const onlineCount = churchServices.filter((item) => item.isOnline).length

  return {
    metrics: [
      { label: 'Cultos cadastrados', value: String(churchServices.length), trend: 'Atualizado em tempo real' },
      { label: 'Cultos online', value: String(onlineCount), trend: `${onlineCount} transmissões ativas` },
      {
        label: 'Cultos presenciais',
        value: String(Math.max(churchServices.length - onlineCount, 0)),
        trend: 'Programação da igreja',
      },
    ],
    churchServices: churchServices.map((item) => ({
      id: item.id,
      name: item.title,
      description: item.description,
      date: dayLabels[item.day] ?? item.day,
      time: `${item.startsAt} - ${item.endsAt}`,
      day: dayLabels[item.day] ?? item.day,
      dayCode: item.day as 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY',
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      isOnline: item.isOnline,
      streamUrl: item.streamUrl ?? undefined,
    })),
  }
}

export const createChurchService = async (
  payload: CreateChurchServicePayload,
): Promise<CreateChurchServiceResponse> => {
  const response = await apiClient.post<CreateChurchServiceResponse>('/church-services', payload)
  return response.data
}

export const updateChurchService = async (
  id: string,
  payload: UpdateChurchServicePayload,
): Promise<UpdateChurchServiceResponse> => {
  const response = await apiClient.patch<UpdateChurchServiceResponse>(`/church-services/${id}`, payload)
  return response.data
}

export const deleteChurchService = async (id: string): Promise<void> => {
  await apiClient.delete(`/church-services/${id}`)
}
