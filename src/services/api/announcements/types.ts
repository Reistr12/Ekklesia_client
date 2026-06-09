export type AnnouncementMetric = {
  label: string
  value: string
  trend: string
}

export type Announcement = {
  id: string
  title: string
  content: string
  channel: string
  reach: string
  date: string
  status: string
  isoDate: string
}

export type AnnouncementsData = {
  metrics: AnnouncementMetric[]
  announcements: Announcement[]
}

export type CreateAnnouncementPayload = {
  title: string
  content: string
  date: string
}

export type CreateAnnouncementResponse = {
  id: string
  title: string
  content: string
  date: string
}

export type UpdateAnnouncementPayload = Partial<CreateAnnouncementPayload>

export type UpdateAnnouncementResponse = CreateAnnouncementResponse
