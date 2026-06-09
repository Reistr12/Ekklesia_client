import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPrayerData } from '../../../services/api/prayer'
import type { PrayerData } from '../../../services/api/prayer/types'
import { isChurchAdmin } from '../../../utils/auth'

export function usePrayerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [prayerTitle, setPrayerTitle] = useState('')
  const [date, setDate] = useState('')

  const { data, isLoading } = useQuery<PrayerData>({ queryKey: ['prayer'], queryFn: getPrayerData })
  const canManage = isChurchAdmin()

  return {
    isModalOpen,
    setIsModalOpen,
    prayerTitle,
    setPrayerTitle,
    date,
    setDate,
    data,
    isLoading,
    canManage,
  }
}
