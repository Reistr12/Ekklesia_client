import type {
  CreateChurchServicePayload,
  CreateChurchServiceResponse,
  ChurchServicesData,
  UpdateChurchServicePayload,
  UpdateChurchServiceResponse,
} from './types'
import { normalizePaginationParams, type PaginationParams } from '../utils'

export const getChurchServicesData = async (
  params: PaginationParams = {},
): Promise<ChurchServicesData> => {
  const pagination = normalizePaginationParams(params)
  const allServices = [
    {
      id: '1',
      name: 'Culto Domingo Manhã',
      description: 'Culto principal de celebração',
      date: 'Domingo',
      time: '09:00 - 11:00',
      day: 'Domingo',
      dayCode: 'SUNDAY' as const,
      startsAt: '09:00',
      endsAt: '11:00',
      isOnline: false,
    },
    {
      id: '2',
      name: 'Culto Domingo Noite',
      description: 'Culto de louvor e palavra',
      date: 'Domingo',
      time: '18:30 - 20:30',
      day: 'Domingo',
      dayCode: 'SUNDAY' as const,
      startsAt: '18:30',
      endsAt: '20:30',
      isOnline: true,
      streamUrl: 'https://youtube.com/live/exemplo',
    },
    {
      id: '3',
      name: 'Culto de Oração',
      description: 'Momento de intercessão',
      date: 'Quarta-feira',
      time: '20:00 - 21:30',
      day: 'Quarta-feira',
      dayCode: 'WEDNESDAY' as const,
      startsAt: '20:00',
      endsAt: '21:30',
      isOnline: false,
    },
  ]
  const start = (pagination.page - 1) * pagination.limit
  const paginatedServices = allServices.slice(start, start + pagination.limit)
  const total = allServices.length

  return {
    metrics: [
      { label: 'Cultos no mês', value: '22', trend: '+2 vs mês anterior' },
      { label: 'Média de presença', value: '318', trend: '+8.4%' },
      { label: 'Voluntários escalados', value: '74', trend: '100% confirmado' },
    ],
    churchServices: paginatedServices,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
  }
}

export const createChurchService = async (
  payload: CreateChurchServicePayload,
): Promise<CreateChurchServiceResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: crypto.randomUUID(),
        ...payload,
      })
    }, 500)
  })
}

export const updateChurchService = async (
  id: string,
  payload: UpdateChurchServicePayload,
): Promise<UpdateChurchServiceResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: payload.title ?? 'Culto',
        description: payload.description ?? '',
        day: payload.day ?? 'SUNDAY',
        startsAt: payload.startsAt ?? '00:00',
        endsAt: payload.endsAt ?? '00:00',
        isOnline: payload.isOnline ?? false,
        streamUrl: payload.streamUrl,
      })
    }, 500)
  })
}

export const deleteChurchService = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500)
  })
}
