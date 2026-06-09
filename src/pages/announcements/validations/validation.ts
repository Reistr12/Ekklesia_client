import type { CreateAnnouncementPayload } from '../../../services/api/announcements/types'

export type AnnouncementValidationErrors = Partial<Record<'title' | 'content' | 'date', string>>

export function validateAnnouncementForm(payload: CreateAnnouncementPayload): AnnouncementValidationErrors {
  const errors: AnnouncementValidationErrors = {}

  if (payload.title.trim().length === 0) {
    errors.title = 'O título é obrigatório.'
  }

  if (payload.content.trim().length === 0) {
    errors.content = 'O conteúdo é obrigatório.'
  }

  if (payload.date.trim().length === 0) {
    errors.date = 'A data é obrigatória.'
  }

  return errors
}
