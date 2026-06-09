import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getChurchServicesData } from '../../../services/api/church-services'
import type { ChurchServicesData } from '../../../services/api/church-services/types'
import { isChurchAdmin } from '../../../utils/auth'

export function useChurchServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [serviceName, setServiceName] = useState('')
  const [date, setDate] = useState('')

  const { data, isLoading } = useQuery<ChurchServicesData>({ queryKey: ['church-services'], queryFn: getChurchServicesData })
  const canManage = isChurchAdmin()

  return {
    isModalOpen,
    setIsModalOpen,
    serviceName,
    setServiceName,
    date,
    setDate,
    data,
    isLoading,
    canManage,
  }
}
