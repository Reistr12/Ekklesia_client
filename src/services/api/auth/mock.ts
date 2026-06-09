import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from './types'

type MockUser = {
  name: string
  email: string
  password: string
}

const users: MockUser[] = [
  {
    name: 'Admin Ekklesia',
    email: 'admin@ekklesia.local',
    password: '123456',
  },
]

const toBase64Url = (value: string) => {
  return btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const user = users.find((entry) => entry.email.toLowerCase() === payload.email.toLowerCase())

  if (!user || user.password !== payload.password) {
    throw new Error('Invalid credentials')
  }

  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const tokenPayload = toBase64Url(
    JSON.stringify({
      sub: `mock-${user.email}`,
      email: user.email,
      role: 'ADMIN',
      churchId: 'mock-church-1',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    }),
  )

  return {
    accessToken: `${header}.${tokenPayload}.mock-signature`,
  }
}

export const register = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const existingUser = users.find((entry) => entry.email.toLowerCase() === payload.email.toLowerCase())

  if (existingUser) {
    throw new Error('Email already registered')
  }

  users.push({
    name: payload.name,
    email: payload.email,
    password: payload.password,
  })
}
