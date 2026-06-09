const runtimeEnv = import.meta.env as Record<string, string | boolean | undefined>

const readString = (defaultValue: string, ...keys: string[]) => {
  for (const key of keys) {
    const value = runtimeEnv[key]

    if (typeof value === 'string' && value.trim() !== '') {
      return value
    }
  }

  return defaultValue
}

const readBoolean = (defaultValue: boolean, ...keys: string[]) => {
  for (const key of keys) {
    const value = runtimeEnv[key]

    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'string' && value.trim() !== '') {
      return value.toLowerCase() === 'true'
    }
  }

  return defaultValue
}

export const env = {
  applicationEnv: readString('development', 'VITE_APPLICATION_ENV', 'APPLICATION_ENV', 'NODE_ENV'),
  apiBaseUrl: readString('', 'VITE_API_URL', 'VITE_API_MODULE_BASE_URL'),
  useMock: readBoolean(false, 'VITE_REACT_USE_MOCKS', 'VITE_REACT_USE_MOCK', 'VITE_USE_MOCKS'),
}

const isDevelopment = env.applicationEnv === 'development'

if (!isDevelopment && env.apiBaseUrl.trim() === '') {
  throw new Error('VITE_API_URL is required outside development.')
}

if (!isDevelopment && env.useMock) {
  throw new Error('Mock mode is not allowed outside development.')
}
