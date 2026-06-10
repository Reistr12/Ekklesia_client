import type { CreateRecordedServicePayload } from '../../../services/api/recorded-services/types'

export type RecordedServiceValidationErrors = Partial<Record<'serviceId' | 'preacher' | 'topic' | 'date', string>>

export function validateRecordedServiceForm(payload: CreateRecordedServicePayload): RecordedServiceValidationErrors {
  const errors: RecordedServiceValidationErrors = {}

  if (payload.serviceId.trim().length === 0) {
    errors.serviceId = 'O culto é obrigatório.'
  }

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
