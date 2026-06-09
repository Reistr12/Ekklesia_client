import axios from 'axios'
import { env } from '../env/config'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../../utils/auth'
import { queryClient } from '../../lib/queryClient'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
})

type RetryableRequestConfig = {
  _retry?: boolean
  headers?: Record<string, string>
  url?: string
}

type RefreshResponse = {
  accessToken?: string
  refreshToken?: string
}

let refreshPromise: Promise<string | null> | null = null

const shouldSkipRefresh = (url?: string) => {
  if (!url) {
    return false
  }

  return url.includes('/auth/login') || url.includes('/auth/refresh')
}

const logoutAndRedirect = async () => {
  clearAuthSession()
  await queryClient.clear()

  if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
    window.location.replace('/auth')
  }
}

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }

  const response = await axios.post<RefreshResponse>(
    '/auth/refresh',
    { refreshToken },
    {
      baseURL: env.apiBaseUrl,
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  )

  const newAccessToken = response.data?.accessToken
  if (!newAccessToken || newAccessToken.trim() === '') {
    return null
  }

  setAccessToken(newAccessToken)

  if (typeof response.data?.refreshToken === 'string' && response.data.refreshToken.trim() !== '') {
    setRefreshToken(response.data.refreshToken)
  }

  return newAccessToken
}

apiClient.interceptors.request.use((config) => {
  if (typeof config.url === 'string' && config.url.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '')
  }

  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status as number | undefined
    const originalRequest = (error?.config ?? {}) as RetryableRequestConfig

    if (status === 401 && !originalRequest._retry && !shouldSkipRefresh(originalRequest.url)) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }

        const newAccessToken = await refreshPromise
        if (newAccessToken) {
          originalRequest.headers = {
            ...(originalRequest.headers ?? {}),
            Authorization: `Bearer ${newAccessToken}`,
          }

          return apiClient(originalRequest)
        }
      } catch {
        // Falls through to logout.
      }

      await logoutAndRedirect()
    }

    if (status === 403) {
      await logoutAndRedirect()
    }

    return Promise.reject(error)
  },
)
