import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getEventsData } from '../../../services/api/events'
import type { EventsData } from '../../../services/api/events/types'
import { isChurchAdmin } from '../../../utils/auth'

export function useEventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventName, setEventName] = useState('')
  const [date, setDate] = useState('')

  const { data, isLoading } = useQuery<EventsData>({ queryKey: ['events'], queryFn: getEventsData })
  const canManage = isChurchAdmin()

  return {
    isModalOpen,
    setIsModalOpen,
    eventName,
    setEventName,
    date,
    setDate,
    data,
    isLoading,
    canManage,
  }
}
