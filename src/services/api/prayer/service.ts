import { apiClient } from '../../axios/client'
import type {
  CreatePrayerPayload,
  CreatePrayerResponse,
  PrayerData,
  UpdatePrayerPayload,
  UpdatePrayerResponse,
} from './types'
import { formatDate, toArray } from '../utils'

type ApiPrayer = {
  id: string
  name: string
  request: string
  createdAt: string
  deletedAt?: string
}

export const getPrayerData = async (): Promise<PrayerData> => {
  const response = await apiClient.get<ApiPrayer[]>('/prayer-requests')
  const prayers = toArray<ApiPrayer>(response.data)
  const open = prayers.filter((item) => !item.deletedAt).length

  return {
    metrics: [
      { label: 'Pedidos totais', value: String(prayers.length), trend: `${open} abertos` },
      { label: 'Abertos', value: String(open), trend: 'Intercessão em andamento' },
      {
        label: 'Finalizados',
        value: String(Math.max(prayers.length - open, 0)),
        trend: 'Pedidos concluídos',
      },
    ],
    prayers: prayers.map((item) => ({
      id: item.id,
      name: item.name,
      request: item.request,
      date: formatDate(item.createdAt),
      status: item.deletedAt ? 'Closed' : 'Open',
      createdAt: item.createdAt,
    })),
  }
}

export const createPrayer = async (payload: CreatePrayerPayload): Promise<CreatePrayerResponse> => {
  const response = await apiClient.post<CreatePrayerResponse>('/prayer-requests', payload)
  return response.data
}

export const updatePrayer = async (id: string, payload: UpdatePrayerPayload): Promise<UpdatePrayerResponse> => {
  const response = await apiClient.patch<UpdatePrayerResponse>(`/prayer-requests/${id}`, payload)
  return response.data
}

export const deletePrayer = async (id: string): Promise<void> => {
  await apiClient.delete(`/prayer-requests/${id}`)
}
