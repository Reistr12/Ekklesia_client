import type { CreateEventPayload } from '../../../services/api/events/types'

export type EventValidationErrors = Partial<Record<'title' | 'description' | 'date', string>>

export function validateEventForm(payload: CreateEventPayload): EventValidationErrors {
  const errors: EventValidationErrors = {}

  if (payload.title.trim().length === 0) {
    errors.title = 'O nome do evento é obrigatório.'
  }

  if (payload.description.trim().length === 0) {
    errors.description = 'A descrição é obrigatória.'
  }

  if (payload.date.trim().length === 0) {
    errors.date = 'A data é obrigatória.'
  }

  return errors
}
