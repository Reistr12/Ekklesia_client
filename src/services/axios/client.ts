import axios from 'axios'
import { env } from '../env/config'
import { getAccessToken } from '../../utils/auth'

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
