import type {
  CreateEventPayload,
  CreateEventResponse,
  EventsData,
  UpdateEventPayload,
  UpdateEventResponse,
} from './types'
import { normalizePaginationParams, type PaginationParams } from '../utils'

export const getEventsData = async (params: PaginationParams = {}): Promise<EventsData> => {
  const pagination = normalizePaginationParams(params)
  const allEvents = [
    {
      id: '1',
      name: 'Conferência de Casais',
      description: 'Encontro anual de casais',
      date: '14/06/2026',
      attendees: 320,
      category: 'Família',
      status: 'Scheduled',
      isoDate: '2026-06-14T19:00:00.000Z',
    },
    {
      id: '2',
      name: 'Imersão de Liderança',
      description: 'Treinamento de liderança',
      date: '22/06/2026',
      attendees: 148,
      category: 'Liderança',
      status: 'Scheduled',
      isoDate: '2026-06-22T19:00:00.000Z',
    },
    {
      id: '3',
      name: 'Noite de Louvor',
      description: 'Noite especial de adoração',
      date: '29/05/2026',
      attendees: 578,
      category: 'Adoração',
      status: 'Completed',
      isoDate: '2026-05-29T19:00:00.000Z',
    },
  ]
  const start = (pagination.page - 1) * pagination.limit
  const paginatedEvents = allEvents.slice(start, start + pagination.limit)
  const total = allEvents.length

  return {
    metrics: [
      { label: 'Eventos ativos', value: '9', trend: '+2 em planejamento' },
      { label: 'Inscritos totais', value: '1.046', trend: '+11.7%' },
      { label: 'Taxa de presença', value: '87%', trend: '+3.1%' },
    ],
    events: paginatedEvents,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
  }
}

export const createEvent = async (payload: CreateEventPayload): Promise<CreateEventResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: crypto.randomUUID(), ...payload }), 500)
  })
}

export const updateEvent = async (id: string, payload: UpdateEventPayload): Promise<UpdateEventResponse> => {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          id,
          title: payload.title ?? 'Evento',
          description: payload.description ?? '',
          date: payload.date ?? new Date().toISOString(),
        }),
      500,
    )
  })
}

export const deleteEvent = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500)
  })
}
