import type { CreateMemberPayload } from '../../../services/api/members/types'

export type MemberValidationErrors = Partial<Record<'name' | 'phone' | 'dateOfBirth', string>>

export function validateMemberForm(payload: CreateMemberPayload): MemberValidationErrors {
  const errors: MemberValidationErrors = {}

  if (payload.name.trim().length === 0) {
    errors.name = 'O nome é obrigatório.'
  }

  if ((payload.phone ?? '').trim().length === 0) {
    errors.phone = 'O telefone é obrigatório.'
  }

  if (payload.dateOfBirth.trim().length === 0) {
    errors.dateOfBirth = 'A data de nascimento é obrigatória.'
  }

  return errors
}
