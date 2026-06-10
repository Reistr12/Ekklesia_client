export type ScheduleValidationErrors = Partial<Record<'title' | 'date' | 'time' | 'ministry', string>>

export function validateScheduleForm(payload: {
  title: string
  date: string
  time: string
  ministry: string
}): ScheduleValidationErrors {
  const errors: ScheduleValidationErrors = {}

  if (payload.title.trim().length === 0) {
    errors.title = 'O título é obrigatório.'
  }

  if (payload.date.trim().length === 0) {
    errors.date = 'A data é obrigatória.'
  }

  if (payload.time.trim().length === 0) {
    errors.time = 'A hora é obrigatória.'
  }

  if (payload.ministry.trim().length === 0) {
    errors.ministry = 'O ministério é obrigatório.'
  }

  return errors
}
