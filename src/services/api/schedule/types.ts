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
  agendaType: 'MINISTERIAL' | 'PASTOR'
}

export type ScheduleData = {
  metrics: ScheduleMetric[]
  items: ScheduleItem[]
}
