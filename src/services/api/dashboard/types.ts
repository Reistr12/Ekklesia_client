export type DashboardMetric = {
  label: string
  value: string
  trend: string
}

export type GrowthPoint = {
  month: string
  value: number
}

export type UpcomingEvent = {
  id: string
  title: string
  description: string
  date: string
  isoDate: string
  owner: string
}

export type PrayerRequest = {
  name: string
  request: string
}

export type Activity = {
  description: string
  time: string
}

export type DashboardData = {
  metrics: DashboardMetric[]
  growth: GrowthPoint[]
  upcomingEvents: UpcomingEvent[]
  prayerRequests: PrayerRequest[]
  activities: Activity[]
  degraded: boolean
  degradedSources: string[]
}
