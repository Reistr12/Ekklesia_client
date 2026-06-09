import type { CreateChurchServicePayload } from '../../../services/api/church-services/types'

export type ChurchServiceValidationErrors = Partial<Record<'title' | 'description' | 'day' | 'startsAt' | 'endsAt', string>>

export function validateChurchServiceForm(payload: CreateChurchServicePayload): ChurchServiceValidationErrors {
  const errors: ChurchServiceValidationErrors = {}

  if (payload.title.trim().length === 0) {
    errors.title = 'O título é obrigatório.'
  }

  if (payload.description.trim().length === 0) {
    errors.description = 'A descrição é obrigatória.'
  }

  if (!payload.day) {
    errors.day = 'O dia é obrigatório.'
  }

  if (payload.startsAt.trim().length === 0) {
    errors.startsAt = 'O horário de início é obrigatório.'
  }

  if (payload.endsAt.trim().length === 0) {
    errors.endsAt = 'O horário de término é obrigatório.'
  }

  return errors
}
