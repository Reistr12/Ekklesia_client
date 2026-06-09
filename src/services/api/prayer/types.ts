export type PrayerMetric = {
  label: string
  value: string
  trend: string
}

export type PrayerEntry = {
  id: string
  name: string
  request: string
  date: string
  status: string
  createdAt: string
}

export type PrayerData = {
  metrics: PrayerMetric[]
  prayers: PrayerEntry[]
}

export type CreatePrayerPayload = {
  name: string
  request: string
}

export type CreatePrayerResponse = {
  id: string
  name: string
  request: string
}

export type UpdatePrayerPayload = Partial<CreatePrayerPayload>

export type UpdatePrayerResponse = CreatePrayerResponse
