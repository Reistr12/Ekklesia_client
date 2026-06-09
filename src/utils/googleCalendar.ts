type GoogleCalendarDraftInput = {
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
}

const formatGoogleDate = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

const parseDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

export const buildGoogleCalendarDraftUrl = ({
  title,
  description,
  startDate,
  endDate,
  location,
}: GoogleCalendarDraftInput) => {
  const start = parseDate(startDate)
  if (!start) {
    return null
  }

  const end = parseDate(endDate ?? '') ?? new Date(start.getTime() + 60 * 60 * 1000)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
  })

  if (description && description.trim().length > 0) {
    params.set('details', description)
  }

  if (location && location.trim().length > 0) {
    params.set('location', location)
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export const openGoogleCalendarDraft = (event: GoogleCalendarDraftInput) => {
  const url = buildGoogleCalendarDraftUrl(event)
  if (!url) {
    return false
  }

  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}
