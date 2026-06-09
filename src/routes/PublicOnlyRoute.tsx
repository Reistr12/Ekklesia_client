import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

type PublicOnlyRouteProps = {
  children: ReactNode
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
