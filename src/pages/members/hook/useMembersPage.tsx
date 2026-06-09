import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMembersData } from '../../../services/api/members'
import type { MembersData } from '../../../services/api/members/types'
import { isChurchAdmin } from '../../../utils/auth'

export function useMembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [role, setRole] = useState('')

  const { data, isLoading } = useQuery<MembersData>({ queryKey: ['members'], queryFn: getMembersData })
  const canManage = isChurchAdmin()

  return {
    isModalOpen,
    setIsModalOpen,
    memberName,
    setMemberName,
    role,
    setRole,
    data,
    isLoading,
    canManage,
  }
}
