export type SupervisorMetric = {
  label: string
  value: string
  trend: string
}

export type Supervisor = {
  id: string
  name: string
  email: string
  phone: string
  role: string
}

export type SupervisorsData = {
  metrics: SupervisorMetric[]
  supervisors: Supervisor[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CreateSupervisorPayload = {
  name: string
  email: string
  password: string
  phone: string
  role: 'SUPERVISOR' | 'ADMIN'
}

export type CreateSupervisorResponse = {
  id: string
  name: string
  email: string
  phone: string
  role: string
}
