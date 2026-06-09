import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAnnouncementsData } from '../../../services/api/announcements'
import type { AnnouncementsData } from '../../../services/api/announcements/types'
import { isChurchAdmin } from '../../../utils/auth'

export function useAnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery<AnnouncementsData>({ queryKey: ['avisos'], queryFn: getAnnouncementsData })
  const canManage = isChurchAdmin()

  return {
    isModalOpen,
    setIsModalOpen,
    title,
    setTitle,
    channel,
    setChannel,
    date,
    setDate,
    status,
    setStatus,
    data,
    isLoading,
    canManage,
  }
}
