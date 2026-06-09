import type { CreateRecordedServicePayload } from '../../../services/api/recorded-services/types'

export type RecordedServiceValidationErrors = Partial<Record<'preacher' | 'topic' | 'date', string>>

export function validateRecordedServiceForm(payload: CreateRecordedServicePayload): RecordedServiceValidationErrors {
  const errors: RecordedServiceValidationErrors = {}

  if (payload.preacher.trim().length === 0) {
    errors.preacher = 'O pregador é obrigatório.'
  }

  if (payload.topic.trim().length === 0) {
    errors.topic = 'O tema é obrigatório.'
  }

  if (payload.date.trim().length === 0) {
    errors.date = 'A data é obrigatória.'
  }

  return errors
}
