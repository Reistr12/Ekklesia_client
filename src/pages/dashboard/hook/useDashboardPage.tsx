import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '../../../services/api/dashboard'
import type { DashboardData } from '../../../services/api/dashboard/types'
import { isChurchAdmin } from '../../../utils/auth'

export function useDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading } = useQuery<DashboardData>({ queryKey: ['dashboard'], queryFn: getDashboardData })
  const canManage = isChurchAdmin()

  return {
    isModalOpen,
    setIsModalOpen,
    data,
    isLoading,
    canManage,
  }
}
