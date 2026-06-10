import { apiClient } from '../../axios/client'
import type {
  CreateRecordedServicePayload,
  CreateRecordedServiceResponse,
  RecordedServicesData,
  UpdateRecordedServicePayload,
  UpdateRecordedServiceResponse,
} from './types'
import {
  formatDate,
  normalizePaginationParams,
  toPaginatedResponse,
  type PaginatedResponse,
  type PaginationParams,
} from '../utils'

type ApiRecordedService = {
  id: string
  serviceId: string
  preacher: string
  topic: string
  notes?: string
  date: string
}

export const getRecordedServicesData = async (
  params: PaginationParams = {},
): Promise<RecordedServicesData> => {
  const pagination = normalizePaginationParams(params)
  const response = await apiClient.get<PaginatedResponse<ApiRecordedService>>('/church-service-records', {
    params: pagination,
  })
  const paginated = toPaginatedResponse<ApiRecordedService>(response.data, pagination)
  const records = paginated.data
  const thisMonth = records.filter((item) => {
    const date = new Date(item.date)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  return {
    metrics: [
      { label: 'Registros totais', value: String(paginated.total), trend: 'Histórico de cultos' },
      { label: 'No mês', value: String(thisMonth), trend: 'Registro mensal' },
      { label: 'Com pregador', value: String(records.filter((item) => Boolean(item.preacher)).length), trend: 'Dados completos' },
    ],
    recordedServices: records.map((item) => ({
      id: item.id,
      serviceId: item.serviceId,
      date: formatDate(item.date),
      isoDate: item.date,
      theme: item.topic,
      preacher: item.preacher,
      attendance: 0,
      visitors: 0,
      notes: item.notes,
    })),
    total: paginated.total,
    page: paginated.page,
    limit: paginated.limit,
    totalPages: paginated.totalPages,
  }
}

export const createRecordedService = async (
  payload: CreateRecordedServicePayload,
): Promise<CreateRecordedServiceResponse> => {
  const response = await apiClient.post<CreateRecordedServiceResponse>('/church-service-records', payload)
  return response.data
}

export const updateRecordedService = async (
  id: string,
  payload: UpdateRecordedServicePayload,
): Promise<UpdateRecordedServiceResponse> => {
  const response = await apiClient.patch<UpdateRecordedServiceResponse>(`/church-service-records/${id}`, payload)
  return response.data
}

export const deleteRecordedService = async (id: string): Promise<void> => {
  await apiClient.delete(`/church-service-records/${id}`)
}
