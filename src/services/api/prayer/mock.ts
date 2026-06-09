import type {
  CreatePrayerPayload,
  CreatePrayerResponse,
  PrayerData,
  UpdatePrayerPayload,
  UpdatePrayerResponse,
} from './types'

export const getPrayerData = async (): Promise<PrayerData> => {
  return {
    metrics: [
      { label: 'Pedidos recebidos', value: '37', trend: '+5 esta semana' },
      { label: 'Pedidos atendidos', value: '21', trend: '57% concluído' },
      { label: 'Intercessores ativos', value: '46', trend: '+2 no mês' },
    ],
    prayers: [
      { id: '1', name: 'Renata', request: 'Recuperação pós-cirurgia', date: '21/05/2026', status: 'Open', createdAt: '2026-05-21T10:00:00.000Z' },
      { id: '2', name: 'Eduardo', request: 'Direção para decisão profissional', date: '20/05/2026', status: 'Open', createdAt: '2026-05-20T10:00:00.000Z' },
      { id: '3', name: 'Família Alves', request: 'Restauração familiar', date: '18/05/2026', status: 'Closed', createdAt: '2026-05-18T10:00:00.000Z' },
    ],
  }
}

export const createPrayer = async (payload: CreatePrayerPayload): Promise<CreatePrayerResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: crypto.randomUUID(), ...payload }), 500)
  })
}

export const updatePrayer = async (id: string, payload: UpdatePrayerPayload): Promise<UpdatePrayerResponse> => {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          id,
          name: payload.name ?? 'Pedido',
          request: payload.request ?? '',
        }),
      500,
    )
  })
}

export const deletePrayer = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500)
  })
}
