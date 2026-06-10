export type ChurchServiceMetric = {
  label: string
  value: string
  trend: string
}

export type ChurchService = {
  id: string
  name: string
  description: string
  date: string
  time: string
  day: string
  dayCode: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'
  startsAt: string
  endsAt: string
  isOnline: boolean
  streamUrl?: string
}

export type ChurchServicesData = {
  metrics: ChurchServiceMetric[]
  churchServices: ChurchService[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CreateChurchServicePayload = {
  title: string
  description: string
  day: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'
  startsAt: string
  endsAt: string
  isOnline: boolean
  streamUrl?: string
}

export type CreateChurchServiceResponse = {
  id: string
  title: string
  description: string
  day: string
  startsAt: string
  endsAt: string
  isOnline: boolean
  streamUrl?: string
}

export type UpdateChurchServicePayload = Partial<CreateChurchServicePayload>

export type UpdateChurchServiceResponse = CreateChurchServiceResponse
