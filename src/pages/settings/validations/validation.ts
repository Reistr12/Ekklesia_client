export type SettingsValidationErrors = Partial<Record<'moduleName' | 'status', string>>

export function validateSettingsForm(payload: { moduleName: string; status: string }): SettingsValidationErrors {
  const errors: SettingsValidationErrors = {}

  if (payload.moduleName.trim().length === 0) {
    errors.moduleName = 'O módulo é obrigatório.'
  }

  if (payload.status.trim().length === 0) {
    errors.status = 'O status é obrigatório.'
  }

  return errors
}
