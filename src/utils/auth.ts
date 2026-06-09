const ACCESS_TOKEN_KEY = 'ekklesia.access_token'

type AuthTokenPayload = {
  sub?: string
  email?: string
  role?: string
  churchId?: string
}

const parseJwtPayload = (token: string): AuthTokenPayload | null => {
  try {
    const parts = token.split('.')
    if (parts.length < 2) {
      return null
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = atob(padded)
    const payload = JSON.parse(decoded) as AuthTokenPayload

    return payload
  } catch {
    return null
  }
}

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export const isAuthenticated = () => {
  return Boolean(getAccessToken())
}

export const getAuthContext = () => {
  const token = getAccessToken()
  if (!token) {
    return null
  }

  return parseJwtPayload(token)
}

export const isChurchAdmin = () => {
  const authContext = getAuthContext()
  if (!authContext?.churchId || !authContext.role) {
    return false
  }

  return authContext.role.toUpperCase() === 'ADMIN'
}

export const hasAnyRole = (...roles: string[]) => {
  const authContext = getAuthContext()
  if (!authContext?.role) {
    return false
  }

  const currentRole = authContext.role.toUpperCase()
  return roles.map((role) => role.toUpperCase()).includes(currentRole)
}
