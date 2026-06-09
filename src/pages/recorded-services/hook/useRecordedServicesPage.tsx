import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRecordedServicesData } from '../../../services/api/recorded-services'
import type { RecordedServicesData } from '../../../services/api/recorded-services/types'
import { isChurchAdmin } from '../../../utils/auth'

export function useRecordedServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [serviceName, setServiceName] = useState('')
  const [date, setDate] = useState('')

  const { data, isLoading } = useQuery<RecordedServicesData>({ queryKey: ['recorded-services'], queryFn: getRecordedServicesData })
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
