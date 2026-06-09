import { apiClient } from '../../axios/client'
import type { ScheduleData } from './types'
import { getAuthContext } from '../../../utils/auth'
import { formatDate, formatTime, toArray, toIsoDate } from '../utils'

type ApiChurchService = {
  id: string
  title: string
  startsAt?: string
  day?: string
}

type ApiChurchEvent = {
  id: string
  title: string
  date: string
}

type ApiBirthday = {
  id: string
  name: string
  dateOfBirth: string
}

type AgendaResponse = {
  services: ApiChurchService[]
  events: ApiChurchEvent[]
  birthdays: ApiBirthday[]
}

export const getScheduleData = async (): Promise<ScheduleData> => {
  const authContext = getAuthContext()
  const churchId = authContext?.churchId

  if (!churchId) {
    return {
      metrics: [
        { label: 'Itens da agenda', value: '0', trend: 'Usuário sem igreja vinculada' },
        { label: 'Eventos', value: '0', trend: 'Sem acesso' },
        { label: 'Aniversários', value: '0', trend: 'Sem acesso' },
      ],
      items: [],
    }
  }

  const response = await apiClient.get<AgendaResponse>(`/churches/${churchId}/agenda`, {
    params: {
      filter: 'month',
      date: toIsoDate(),
    },
  })

  const services = toArray<ApiChurchService>(response.data?.services)
  const events = toArray<ApiChurchEvent>(response.data?.events)
  const birthdays = toArray<ApiBirthday>(response.data?.birthdays)

  const items = [
    ...services.map((item) => ({
      title: item.title,
      date: formatDate(item.startsAt),
      time: formatTime(item.startsAt),
      ministry: 'Service',
      priority: 'Medium',
    })),
    ...events.map((item) => ({
      title: item.title,
      date: formatDate(item.date),
      time: formatTime(item.date),
      ministry: 'Event',
      priority: 'High',
    })),
    ...birthdays.map((item) => ({
      title: `Birthday: ${item.name}`,
      date: formatDate(item.dateOfBirth),
      time: '-',
      ministry: 'People',
      priority: 'Low',
    })),
  ]

  return {
    metrics: [
      { label: 'Itens da agenda', value: String(items.length), trend: 'Atualizado mensalmente' },
      { label: 'Eventos', value: String(events.length), trend: 'Calendário oficial' },
      { label: 'Aniversários', value: String(birthdays.length), trend: 'Membros da igreja' },
    ],
    items,
  }
}
