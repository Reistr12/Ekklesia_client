export type DashboardMetric = {
  label: string
  value: string
  trend: string
}

export type GrowthPoint = {
  month: string
  value: number
}

export type RecentVisitor = {
  name: string
  source: string
  date: string
  status: string
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
  visitors: RecentVisitor[]
  upcomingEvents: UpcomingEvent[]
  prayerRequests: PrayerRequest[]
  activities: Activity[]
}
