import { apiClient } from '../../axios/client'
import { formatDate, toArray } from '../utils'
import type {
  CreateEventPayload,
  CreateEventResponse,
  EventsData,
  UpdateEventPayload,
  UpdateEventResponse,
} from './types'

type ApiChurchEvent = {
  id: string
  title: string
  description: string
  date: string
}

export const getEventsData = async (): Promise<EventsData> => {
  const response = await apiClient.get<ApiChurchEvent[]>('/church-events')
  const events = toArray<ApiChurchEvent>(response.data)
  const now = Date.now()
  const upcoming = events.filter((item) => new Date(item.date).getTime() >= now).length

  return {
    metrics: [
      { label: 'Eventos cadastrados', value: String(events.length), trend: `${upcoming} futuros` },
      { label: 'Próximos eventos', value: String(upcoming), trend: 'Calendário ativo' },
      {
        label: 'Concluídos',
        value: String(Math.max(events.length - upcoming, 0)),
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
