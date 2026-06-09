import type { CreatePrayerPayload } from '../../../services/api/prayer/types'

export type PrayerValidationErrors = Partial<Record<'name' | 'request', string>>

export function validatePrayerForm(payload: CreatePrayerPayload): PrayerValidationErrors {
  const errors: PrayerValidationErrors = {}

  if (payload.name.trim().length === 0) {
    errors.name = 'O nome é obrigatório.'
  }

  if (payload.request.trim().length === 0) {
    errors.request = 'O pedido é obrigatório.'
  }

  return errors
}
