export type ScheduleMetric = {
  label: string
  value: string
  trend: string
}

export type ScheduleItem = {
  title: string
  date: string
  time: string
  ministry: string
  priority: string
}

export type ScheduleData = {
  metrics: ScheduleMetric[]
  items: ScheduleItem[]
}
