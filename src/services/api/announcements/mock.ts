import type {
  AnnouncementsData,
  CreateAnnouncementPayload,
  CreateAnnouncementResponse,
  UpdateAnnouncementPayload,
  UpdateAnnouncementResponse,
} from './types'
import { normalizePaginationParams, type PaginationParams } from '../utils'

export const getAnnouncementsData = async (params: PaginationParams = {}): Promise<AnnouncementsData> => {
  const pagination = normalizePaginationParams(params)
  const allAnnouncements = [
    {
      id: '1',
      title: 'Mudança no horário do culto',
      content: 'O culto de domingo iniciará às 19h.',
      channel: 'App + WhatsApp',
      reach: '91%',
      date: '22/05/2026',
      status: 'Published',
      isoDate: '2026-05-22T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Inscrições para conferência',
      content: 'Inscrições abertas até sexta-feira.',
      channel: 'App + E-mail',
      reach: '88%',
      date: '20/05/2026',
      status: 'Published',
      isoDate: '2026-05-20T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'Escala de voluntários',
      content: 'Escala atualizada para o próximo mês.',
      channel: 'App',
      reach: '74%',
      date: '19/05/2026',
      status: 'Archived',
      isoDate: '2026-05-19T00:00:00.000Z',
    },
  ]
  const start = (pagination.page - 1) * pagination.limit
  const paginatedAnnouncements = allAnnouncements.slice(start, start + pagination.limit)
  const total = allAnnouncements.length

  return {
    metrics: [
      { label: 'Avisos ativos', value: '12', trend: '+3 hoje' },
      { label: 'Alcance médio', value: '86%', trend: '+4.3%' },
      { label: 'Canais integrados', value: '4', trend: 'WhatsApp, app, e-mail, telão' },
    ],
    announcements: paginatedAnnouncements,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
  }
}

export const createAnnouncement = async (
  payload: CreateAnnouncementPayload,
): Promise<CreateAnnouncementResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: crypto.randomUUID(), ...payload }), 500)
  })
}

export const updateAnnouncement = async (
  id: string,
  payload: UpdateAnnouncementPayload,
): Promise<UpdateAnnouncementResponse> => {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          id,
          title: payload.title ?? 'Aviso',
          content: payload.content ?? '',
          date: payload.date ?? new Date().toISOString(),
        }),
      500,
    )
  })
}

export const deleteAnnouncement = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500)
  })
}
