import type { CreateSupervisorPayload } from '../../../services/api/supervisors/types'

export type SupervisorValidationErrors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'role', string>>

export function validateSupervisorForm(payload: CreateSupervisorPayload): SupervisorValidationErrors {
  const errors: SupervisorValidationErrors = {}

  if (payload.name.trim().length === 0) {
    errors.name = 'O nome é obrigatório.'
  }

  if (payload.email.trim().length === 0) {
    errors.email = 'O email é obrigatório.'
  } else if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
    errors.email = 'Informe um email válido.'
  }

  if ((payload.phone ?? '').trim().length === 0) {
    errors.phone = 'O telefone é obrigatório.'
  }

  if (payload.password.trim().length === 0) {
    errors.password = 'A senha é obrigatória.'
  }

  if (!payload.role) {
    errors.role = 'O perfil é obrigatório.'
  }

  return errors
}
