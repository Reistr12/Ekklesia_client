import { apiClient } from '../../axios/client'
import type { ScheduleData } from './types'
import { getAuthContext } from '../../../utils/auth'
import { formatDate, formatTime, toArray, toIsoDate } from '../utils'

type ApiChurchService = {
  id: string
  title: string
  startsAt?: string
  endsAt?: string
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

const dayLabels: Record<string, string> = {
  SUNDAY: 'Domingo',
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
}

const formatServiceDate = (service: ApiChurchService) => {
  if (!service.day) {
    return '-'
  }

  const normalizedDay = service.day.trim().toUpperCase()

  return dayLabels[normalizedDay] ?? service.day
}

const formatServiceTime = (service: ApiChurchService) => {
  const startsAt = service.startsAt?.trim()
  const endsAt = service.endsAt?.trim()

  if (!startsAt && !endsAt) {
    return '-'
  }

  if (startsAt && endsAt) {
    return `${startsAt} - ${endsAt}`
  }

  return startsAt ?? endsAt ?? '-'
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
      date: formatServiceDate(item),
      time: formatServiceTime(item),
      ministry: 'Service',
      agendaType: 'MINISTERIAL' as const,
    })),
    ...events.map((item) => ({
      title: item.title,
      date: formatDate(item.date),
      time: formatTime(item.date),
      ministry: 'Event',
      agendaType: 'MINISTERIAL' as const,
    })),
    ...birthdays.map((item) => ({
      title: `Birthday: ${item.name}`,
      date: formatDate(item.dateOfBirth),
      time: '-',
      ministry: 'People',
      agendaType: 'MINISTERIAL' as const,
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
