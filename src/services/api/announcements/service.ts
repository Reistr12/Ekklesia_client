import { apiClient } from '../../axios/client'
import type {
  AnnouncementsData,
  CreateAnnouncementPayload,
  CreateAnnouncementResponse,
  UpdateAnnouncementPayload,
  UpdateAnnouncementResponse,
} from './types'
import { formatDate, toArray } from '../utils'

type ApiAnnouncement = {
  id: string
  title: string
  content: string
  date: string
  deletedAt?: string
}

export const getAnnouncementsData = async (): Promise<AnnouncementsData> => {
  const response = await apiClient.get<ApiAnnouncement[]>('/announcements')
  const announcements = toArray<ApiAnnouncement>(response.data)
  const published = announcements.filter((item) => !item.deletedAt).length

  return {
    metrics: [
      { label: 'Avisos totais', value: String(announcements.length), trend: `${published} publicados` },
      { label: 'Publicados', value: String(published), trend: 'Comunicação ativa' },
      {
        label: 'Arquivados',
        value: String(Math.max(announcements.length - published, 0)),
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
