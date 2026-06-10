import { apiClient } from '../../axios/client'
import { formatDate } from '../utils'
import type {
  CreateEventPayload,
  CreateEventResponse,
  EventsData,
  UpdateEventPayload,
  UpdateEventResponse,
} from './types'
import {
  normalizePaginationParams,
  toPaginatedResponse,
  type PaginatedResponse,
  type PaginationParams,
} from '../utils'

type ApiChurchEvent = {
  id: string
  title: string
  description: string
  date: string
}

export const getEventsData = async (params: PaginationParams = {}): Promise<EventsData> => {
  const pagination = normalizePaginationParams(params)
  const response = await apiClient.get<PaginatedResponse<ApiChurchEvent>>('/church-events', {
    params: pagination,
  })
  const paginated = toPaginatedResponse<ApiChurchEvent>(response.data, pagination)
  const events = paginated.data
  const now = Date.now()
  const upcoming = events.filter((item) => new Date(item.date).getTime() >= now).length

  return {
    metrics: [
      { label: 'Eventos cadastrados', value: String(paginated.total), trend: `${upcoming} futuros` },
      { label: 'Próximos eventos', value: String(upcoming), trend: 'Calendário ativo' },
      {
        label: 'Concluídos',
        value: String(Math.max(paginated.total - upcoming, 0)),
        trend: 'Histórico consolidado',
      },
    ],
    events: events.map((item) => ({
      id: item.id,
      name: item.title,
      description: item.description,
      date: formatDate(item.date),
      attendees: 0,
      category: 'Igreja',
      status: new Date(item.date).getTime() >= now ? 'Scheduled' : 'Completed',
      isoDate: item.date,
    })),
    total: paginated.total,
    page: paginated.page,
    limit: paginated.limit,
    totalPages: paginated.totalPages,
  }
}

export const createEvent = async (payload: CreateEventPayload): Promise<CreateEventResponse> => {
  const response = await apiClient.post<CreateEventResponse>('/church-events', payload)
  return response.data
}

export const updateEvent = async (id: string, payload: UpdateEventPayload): Promise<UpdateEventResponse> => {
  const response = await apiClient.patch<UpdateEventResponse>(`/church-events/${id}`, payload)
  return response.data
}

export const deleteEvent = async (id: string): Promise<void> => {
  await apiClient.delete(`/church-events/${id}`)
}
