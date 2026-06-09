import axios from 'axios'
import { env } from '../env/config'
import { clearAccessToken, getAccessToken } from '../../utils/auth'
import { queryClient } from '../../lib/queryClient'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
})

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
    if (status === 401 || status === 403) {
      clearAccessToken()
      await queryClient.clear()

      if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
        window.location.replace('/auth')
      }
    }

    return Promise.reject(error)
  },
)
