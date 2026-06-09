export type EventMetric = {
  label: string
  value: string
  trend: string
}

export type Event = {
  id: string
  name: string
  description: string
  date: string
  attendees: number
  category: string
  status: string
  isoDate: string
}

export type EventsData = {
  metrics: EventMetric[]
  events: Event[]
}

export type CreateEventPayload = {
  title: string
  description: string
  date: string
}

export type CreateEventResponse = {
  id: string
  title: string
  description: string
  date: string
}

export type UpdateEventPayload = Partial<CreateEventPayload>

export type UpdateEventResponse = CreateEventResponse
