import type {
  CreateRecordedServicePayload,
  CreateRecordedServiceResponse,
  RecordedServicesData,
  UpdateRecordedServicePayload,
  UpdateRecordedServiceResponse,
} from './types'

export const getRecordedServicesData = async (): Promise<RecordedServicesData> => {
  return {
    metrics: [
      { label: 'Cultos registrados', value: '96', trend: '+8 no trimestre' },
      { label: 'Média de presença', value: '304', trend: '+5.2%' },
      { label: 'Visitantes recebidos', value: '214', trend: '+12.1%' },
    ],
    recordedServices: [
      { id: '1', date: '17/05/2026', isoDate: '2026-05-17T10:00:00.000Z', theme: 'Esperança Viva', preacher: 'Pr. Daniel', attendance: 332, visitors: 11, notes: 'Culto abençoado' },
      { id: '2', date: '10/05/2026', isoDate: '2026-05-10T10:00:00.000Z', theme: 'Fé em ação', preacher: 'Pr. Miriam', attendance: 318, visitors: 9, notes: 'Boa participação' },
      { id: '3', date: '03/05/2026', isoDate: '2026-05-03T10:00:00.000Z', theme: 'Comunhão real', preacher: 'Pr. Rafael', attendance: 297, visitors: 7, notes: 'Visitantes presentes' },
    ],
  }
}

export const createRecordedService = async (
  payload: CreateRecordedServicePayload,
): Promise<CreateRecordedServiceResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: crypto.randomUUID(), ...payload }), 500)
  })
}

export const updateRecordedService = async (
  id: string,
  payload: UpdateRecordedServicePayload,
): Promise<UpdateRecordedServiceResponse> => {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          id,
          preacher: payload.preacher ?? 'Pregador',
          topic: payload.topic ?? 'Tema',
          date: payload.date ?? new Date().toISOString(),
          serviceId: payload.serviceId,
          bibleVerse: payload.bibleVerse,
          notes: payload.notes,
        }),
      500,
    )
  })
}

export const deleteRecordedService = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500)
  })
}
