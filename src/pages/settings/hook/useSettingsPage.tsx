import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSettingsData } from '../../../services/api/settings'
import type { SettingsData } from '../../../services/api/settings/types'
import { isChurchAdmin } from '../../../utils/auth'

export function useSettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [settingName, setSettingName] = useState('')
  const [value, setValue] = useState('')

  const { data, isLoading } = useQuery<SettingsData>({ queryKey: ['settings'], queryFn: getSettingsData })
  const canManage = isChurchAdmin()

  return {
    isModalOpen,
    setIsModalOpen,
    settingName,
    setSettingName,
    value,
    setValue,
    data,
    isLoading,
    canManage,
  }
}
