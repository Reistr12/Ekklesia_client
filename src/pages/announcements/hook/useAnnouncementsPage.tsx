import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAnnouncement, getAnnouncementsData } from '../../../services/api/announcements'
import type { AnnouncementsData } from '../../../services/api/announcements/types'
import { isChurchAdmin } from '../../../utils/auth'

const PAGE_SIZE = 10
const ANNOUNCEMENTS_QUERY_KEY = ['avisos'] as const

export function useAnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState('')
  const [status, setStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<AnnouncementsData>({
    queryKey: [...ANNOUNCEMENTS_QUERY_KEY, currentPage, PAGE_SIZE],
    queryFn: () => getAnnouncementsData({ page: currentPage, limit: PAGE_SIZE }),
  })
  const canManage = isChurchAdmin()

  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: async () => {
      setTitle('')
      setChannel('')
      setStatus('')
      setIsModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY })
    },
  })

  const handleCreateAnnouncement = async () => {
    await createMutation.mutateAsync({
      title,
      content: `${channel} - ${status}`,
      date: new Date().toISOString(),
    })
  }

  return {
    isModalOpen,
    setIsModalOpen,
    title,
    setTitle,
    channel,
    setChannel,
    status,
    setStatus,
    handleCreateAnnouncement,
    isSubmitting: createMutation.isPending,
    currentPage,
    setCurrentPage,
    pageSize: PAGE_SIZE,
    totalItems: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    safeCurrentPage: data?.page ?? currentPage,
    data,
    isLoading,
    canManage,
  }
}
