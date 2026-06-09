import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getScheduleData } from '../../../services/api/schedule'
import type { ScheduleData } from '../../../services/api/schedule/types'
import { isChurchAdmin } from '../../../utils/auth'

export function useSchedulePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scheduleName, setScheduleName] = useState('')
  const [date, setDate] = useState('')

  const { data, isLoading } = useQuery<ScheduleData>({ queryKey: ['schedule'], queryFn: getScheduleData })
  const canManage = isChurchAdmin()

  return {
    isModalOpen,
    setIsModalOpen,
    scheduleName,
    setScheduleName,
    date,
    setDate,
    data,
    isLoading,
    canManage,
  }
}
