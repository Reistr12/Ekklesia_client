import { apiClient } from '../../axios/client'
import type {
  AnnouncementsData,
  CreateAnnouncementPayload,
  CreateAnnouncementResponse,
  UpdateAnnouncementPayload,
  UpdateAnnouncementResponse,
} from './types'
import {
  formatDate,
  normalizePaginationParams,
  toPaginatedResponse,
  type PaginatedResponse,
  type PaginationParams,
} from '../utils'

type ApiAnnouncement = {
  id: string
  title: string
  content: string
  date: string
  deletedAt?: string
}

export const getAnnouncementsData = async (params: PaginationParams = {}): Promise<AnnouncementsData> => {
  const pagination = normalizePaginationParams(params)
  const response = await apiClient.get<PaginatedResponse<ApiAnnouncement>>('/announcements', {
    params: pagination,
  })
  const paginated = toPaginatedResponse<ApiAnnouncement>(response.data, pagination)
  const announcements = paginated.data
  const published = announcements.filter((item) => !item.deletedAt).length

  return {
    metrics: [
      { label: 'Avisos totais', value: String(paginated.total), trend: `${published} publicados` },
      { label: 'Publicados', value: String(published), trend: 'Comunicação ativa' },
      {
        label: 'Arquivados',
        value: String(Math.max(paginated.total - published, 0)),
        trend: 'Histórico de avisos',
      },
    ],
    announcements: announcements.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      channel: 'App',
      reach: 'N/A',
      date: formatDate(item.date),
      status: item.deletedAt ? 'Archived' : 'Published',
      isoDate: item.date,
    })),
    total: paginated.total,
    page: paginated.page,
    limit: paginated.limit,
    totalPages: paginated.totalPages,
  }
}

export const createAnnouncement = async (
  payload: CreateAnnouncementPayload,
): Promise<CreateAnnouncementResponse> => {
  const response = await apiClient.post<CreateAnnouncementResponse>('/announcements', payload)
  return response.data
}

export const updateAnnouncement = async (
  id: string,
  payload: UpdateAnnouncementPayload,
): Promise<UpdateAnnouncementResponse> => {
  const response = await apiClient.patch<UpdateAnnouncementResponse>(`/announcements/${id}`, payload)
  return response.data
}

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await apiClient.delete(`/announcements/${id}`)
}
