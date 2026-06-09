import { apiClient } from '../../axios/client'
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from './types'

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  return response.data
}

export const register = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  await apiClient.post('/register', payload)
}
