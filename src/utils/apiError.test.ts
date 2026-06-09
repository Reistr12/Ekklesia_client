import { describe, expect, it } from 'vitest'
import { parseApiError } from './apiError'

describe('parseApiError', () => {
  it('returns backend message and error when available', () => {
    const result = parseApiError(
      {
        response: {
          data: {
            message: 'Validation failed',
            error: 'Bad Request',
          },
        },
      },
      'fallback',
    )

    expect(result).toEqual({
      message: 'Validation failed',
      error: 'Bad Request',
    })
  })

  it('returns fallback when payload is invalid', () => {
    const result = parseApiError({}, 'fallback')

    expect(result).toEqual({ message: 'fallback' })
  })
})
