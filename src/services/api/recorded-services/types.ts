export type RecordedServiceMetric = {
  label: string
  value: string
  trend: string
}

export type RecordedService = {
  id: string
  date: string
  isoDate: string
  theme: string
  preacher: string
  attendance: number
  visitors: number
  notes?: string
}

export type RecordedServicesData = {
  metrics: RecordedServiceMetric[]
  recordedServices: RecordedService[]
}

export type CreateRecordedServicePayload = {
  serviceId?: string
  preacher: string
  topic: string
  bibleVerse?: string
  notes?: string
  date: string
}

export type CreateRecordedServiceResponse = {
  id: string
  serviceId?: string
  preacher: string
  topic: string
  bibleVerse?: string
  notes?: string
  date: string
}

export type UpdateRecordedServicePayload = Partial<CreateRecordedServicePayload>

export type UpdateRecordedServiceResponse = CreateRecordedServiceResponse
