export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken?: string
}

export type RefreshPayload = {
  refreshToken: string
}

export type RefreshResponse = {
  accessToken: string
  refreshToken?: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
  corporateName: string
  cnpj: string
  phone: string
}

export type RegisterResponse = void
