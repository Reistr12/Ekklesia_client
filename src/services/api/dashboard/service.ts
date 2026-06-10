import { apiClient } from '../../axios/client'
import type { DashboardData } from './types'
import { formatDate, formatTime, toPaginatedResponse } from '../utils'

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
    apiClient.get('/members', { params: { page: 1, limit: 100 } }),
    apiClient.get('/church-events', { params: { page: 1, limit: 100 } }),
    apiClient.get('/prayer-requests', { params: { page: 1, limit: 100 } }),
    apiClient.get('/announcements', { params: { page: 1, limit: 100 } }),
    apiClient.get('/church-service-records', { params: { page: 1, limit: 100 } }),
  ])

  const membersPaginated =
    membersResult.status === 'fulfilled'
      ? toPaginatedResponse<ApiMember>(membersResult.value.data, { page: 1, limit: 100 })
      : { data: [], total: 0, page: 1, limit: 100, totalPages: 1 }
  const eventsPaginated =
    eventsResult.status === 'fulfilled'
      ? toPaginatedResponse<ApiChurchEvent>(eventsResult.value.data, { page: 1, limit: 100 })
      : { data: [], total: 0, page: 1, limit: 100, totalPages: 1 }
  const prayersPaginated =
    prayersResult.status === 'fulfilled'
      ? toPaginatedResponse<ApiPrayer>(prayersResult.value.data, { page: 1, limit: 100 })
      : { data: [], total: 0, page: 1, limit: 100, totalPages: 1 }
  const announcementsPaginated =
    announcementsResult.status === 'fulfilled'
      ? toPaginatedResponse<ApiAnnouncement>(announcementsResult.value.data, { page: 1, limit: 100 })
      : { data: [], total: 0, page: 1, limit: 100, totalPages: 1 }
  const recordsPaginated =
    recordsResult.status === 'fulfilled'
      ? toPaginatedResponse<ApiRecord>(recordsResult.value.data, { page: 1, limit: 100 })
      : { data: [], total: 0, page: 1, limit: 100, totalPages: 1 }

  const members = membersPaginated.data
  const events = eventsPaginated.data
  const prayers = prayersPaginated.data
  const announcements = announcementsPaginated.data
  const records = recordsPaginated.data

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

  const growthByMonth = Array.from({ length: 6 }).map((_, index) => {
    const monthDate = new Date()
    monthDate.setMonth(monthDate.getMonth() - (5 - index))

    const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999)

    const month = monthDate.toLocaleDateString('pt-BR', { month: 'short' })
    const value = members.filter((member) => {
      const createdAt = getMemberTimelineDate(member)
      if (!createdAt) {
        return false
      }

      return createdAt <= endOfMonth
    }).length

    return { month, value }
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
      { label: 'Membros', value: String(membersPaginated.total), trend: `+${newMembersThisMonth} no mês` },
      { label: 'Próximos eventos', value: String(eventsPaginated.total), trend: 'Calendário atualizado' },
      { label: 'Pedidos de oração', value: String(prayersPaginated.total), trend: 'Intercessão ativa' },
      { label: 'Registros de culto', value: String(recordsPaginated.total), trend: 'Base histórica' },
    ],
    growth: growthByMonth,
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
