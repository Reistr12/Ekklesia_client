export type ApiErrorDisplay = {
  message: string
  error?: string
}

type ApiErrorPayload = {
  statusCode?: number
  message?: string | string[]
  error?: string
}

const toMessageText = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return value
}

export const parseApiError = (value: unknown, fallbackMessage: string): ApiErrorDisplay => {
  if (typeof value === 'object' && value !== null && 'response' in value) {
    const response = (value as { response?: { data?: ApiErrorPayload } }).response
    const payload = response?.data

    const message = toMessageText(payload?.message)
    const error = payload?.error

    if (typeof message === 'string' && message.trim().length > 0) {
      return {
        message,
        error: typeof error === 'string' && error.trim().length > 0 ? error : undefined,
      }
    }
  }

  if (value instanceof Error && value.message.trim().length > 0) {
    return { message: value.message }
  }

  return { message: fallbackMessage }
}
