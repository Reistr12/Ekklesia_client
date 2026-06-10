type DateInput = string | Date | null | undefined

export type PaginationParams = {
  page?: number
  limit?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

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

const toPositiveInteger = (value: unknown, fallback: number) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return fallback
  }

  return Math.floor(value)
}

export const normalizePaginationParams = (
  params: PaginationParams = {},
  defaults: Required<PaginationParams> = { page: 1, limit: 10 },
): Required<PaginationParams> => {
  const page = toPositiveInteger(params.page, defaults.page)
  const rawLimit = toPositiveInteger(params.limit, defaults.limit)
  const limit = Math.min(rawLimit, 100)

  return { page, limit }
}

export const toPaginatedResponse = <T>(
  value: unknown,
  defaults: Required<PaginationParams> = { page: 1, limit: 10 },
): PaginatedResponse<T> => {
  const normalizedDefaults = normalizePaginationParams(defaults)

  if (typeof value === 'object' && value !== null) {
    const payload = value as {
      data?: unknown
      total?: unknown
      page?: unknown
      limit?: unknown
      totalPages?: unknown
    }

    if (Array.isArray(payload.data)) {
      const data = payload.data as T[]
      const page = toPositiveInteger(payload.page, normalizedDefaults.page)
      const limit = Math.min(toPositiveInteger(payload.limit, normalizedDefaults.limit), 100)
      const total = toPositiveInteger(payload.total, data.length)
      const totalPages = Math.max(1, toPositiveInteger(payload.totalPages, Math.ceil(total / limit)))

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      }
    }
  }

  const data = toArray<T>(value)
  const total = data.length
  const totalPages = Math.max(1, Math.ceil(total / normalizedDefaults.limit))

  return {
    data,
    total,
    page: normalizedDefaults.page,
    limit: normalizedDefaults.limit,
    totalPages,
  }
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
