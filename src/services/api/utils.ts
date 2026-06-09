type DateInput = string | Date | null | undefined

export const formatDate = (value: DateInput) => {
  if (!value) {
    return '-'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('pt-BR')
}

export const formatTime = (value: DateInput) => {
  if (!value) {
    return '-'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export const toArray = <T>(value: unknown): T[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value as T[]
}

export const toIsoDate = (value: DateInput = new Date()) => {
  if (!value) {
    return new Date().toISOString().slice(0, 10)
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10)
  }

  return date.toISOString().slice(0, 10)
}
