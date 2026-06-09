import { apiClient } from '../../axios/client'
import type { DashboardData } from './types'
import { formatDate, formatTime, toArray } from '../utils'

type ApiMember = {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
}

type ApiChurchEvent = {
  id: string
  title: string
  description?: string
  date: string
}

type ApiPrayer = {
  id: string
  name: string
  request: string
  createdAt: string
}

type ApiAnnouncement = {
  id: string
  createdAt?: string
}

type ApiRecord = {
  id: string
  createdAt?: string
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const [membersResult, eventsResult, prayersResult, announcementsResult, recordsResult] = await Promise.allSettled([
    apiClient.get<ApiMember[]>('/members'),
    apiClient.get<ApiChurchEvent[]>('/church-events'),
    apiClient.get<ApiPrayer[]>('/prayer-requests'),
    apiClient.get<ApiAnnouncement[]>('/announcements'),
    apiClient.get<ApiRecord[]>('/church-service-records'),
  ])

  const members = membersResult.status === 'fulfilled' ? toArray<ApiMember>(membersResult.value.data) : []
  const events = eventsResult.status === 'fulfilled' ? toArray<ApiChurchEvent>(eventsResult.value.data) : []
  const prayers = prayersResult.status === 'fulfilled' ? toArray<ApiPrayer>(prayersResult.value.data) : []
  const announcements = announcementsResult.status === 'fulfilled' ? toArray<ApiAnnouncement>(announcementsResult.value.data) : []
  const records = recordsResult.status === 'fulfilled' ? toArray<ApiRecord>(recordsResult.value.data) : []

  const degradedSources = [
    membersResult.status === 'rejected' ? 'membros' : null,
    eventsResult.status === 'rejected' ? 'eventos' : null,
    prayersResult.status === 'rejected' ? 'orações' : null,
    announcementsResult.status === 'rejected' ? 'avisos' : null,
    recordsResult.status === 'rejected' ? 'registros' : null,
  ].filter((value): value is string => value !== null)

  const getMemberTimelineDate = (member: ApiMember) => {
    const reference = member.createdAt ?? member.updatedAt
    if (!reference) {
      return null
    }

    const parsed = new Date(reference)
    if (Number.isNaN(parsed.getTime())) {
      return null
    }

    return parsed
  }

  const now = Date.now()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const newMembersThisMonth = members.filter((member) => {
    const date = getMemberTimelineDate(member)
    if (!date) {
      return false
    }

    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length

  const upcomingEvents = events
    .filter((event) => new Date(event.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  let runningTotal = 0
  const growthByMonth = Array.from({ length: 6 }).map((_, index) => {
    const monthDate = new Date()
    monthDate.setMonth(monthDate.getMonth() - (5 - index))

    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0)
    const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999)

    const month = monthDate.toLocaleDateString('pt-BR', { month: 'short' })
    const value = members.filter((member) => {
      const createdAt = getMemberTimelineDate(member)
      if (!createdAt) {
        return false
      }

      // Série acumulada: total de membros existentes até o fim do mês.
      return createdAt >= startOfMonth && createdAt <= endOfMonth
    }).length

    runningTotal += value
    return { month, value: runningTotal }
  })

  const activities = [
    ...announcements.map((item) => ({
      description: 'Aviso publicado',
      time: formatTime(item.createdAt),
      timestamp: item.createdAt ? new Date(item.createdAt).getTime() : 0,
    })),
    ...records.map((item) => ({
      description: 'Registro de culto adicionado',
      time: formatTime(item.createdAt),
      timestamp: item.createdAt ? new Date(item.createdAt).getTime() : 0,
    })),
    ...prayers.map((item) => ({
      description: 'Pedido de oração recebido',
      time: formatTime(item.createdAt),
      timestamp: new Date(item.createdAt).getTime(),
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4)
    .map(({ description, time }) => ({ description, time }))

  return {
    metrics: [
      { label: 'Membros', value: String(members.length), trend: `+${newMembersThisMonth} no mês` },
      { label: 'Próximos eventos', value: String(upcomingEvents.length), trend: 'Calendário atualizado' },
      { label: 'Pedidos de oração', value: String(prayers.length), trend: 'Intercessão ativa' },
      { label: 'Registros de culto', value: String(records.length), trend: 'Base histórica' },
    ],
    growth: growthByMonth,
    visitors: members.slice(0, 3).map((member) => ({
      name: member.name,
      source: 'Cadastro de membro',
      date: formatDate(member.createdAt),
      status: 'Ativo',
    })),
    upcomingEvents: upcomingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description ?? '',
      date: formatDate(event.date),
      isoDate: event.date,
      owner: 'Equipe da igreja',
    })),
    prayerRequests: prayers.slice(0, 3).map((item) => ({
      name: item.name,
      request: item.request,
    })),
    activities,
    degraded: degradedSources.length > 0,
    degradedSources,
  }
}
