import { useState } from 'react'
import { isChurchAdmin } from '../../../utils/auth'

export function useAuthPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const canManage = isChurchAdmin()

  return {
    isModalOpen,
    setIsModalOpen,
    email,
    setEmail,
    password,
    setPassword,
    data: undefined,
    isLoading: false,
    canManage,
  }
}
