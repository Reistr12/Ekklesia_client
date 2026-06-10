import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { ErrorAlert } from '../../components/feedback/ErrorAlert'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingCard } from '../../components/feedback/LoadingCard'
import { Table } from '../../components/tables/Table'
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal'
import { CreateUpdateModal } from '../../components/ui/CreateUpdateModal'
import { FloatingActionsMenu } from '../../components/ui/FloatingActionsMenu'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { SectionHeaderAction } from '../../components/ui/SectionHeaderAction'
import { StatCard } from '../../components/ui/StatCard'
import { getChurchServicesData } from '../../services/api/church-services'
import type { ChurchServicesData } from '../../services/api/church-services/types'
import {
  createRecordedService,
  deleteRecordedService,
  getRecordedServicesData,
  updateRecordedService,
} from '../../services/api/recorded-services'
import type {
  CreateRecordedServicePayload,
  RecordedService,
  RecordedServicesData,
} from '../../services/api/recorded-services/types'
import { parseApiError, type ApiErrorDisplay } from '../../utils/apiError'
import { hasAnyRole } from '../../utils/auth'
import {
  type RecordedServiceValidationErrors,
  validateRecordedServiceForm,
} from './validations/validation'

type ModalMode = 'create' | 'view' | 'edit'

const PAGE_SIZE = 10
const RECORDED_SERVICES_QUERY_KEY = ['cultos-gravados'] as const
const CHURCH_SERVICES_OPTIONS_QUERY_KEY = ['cultos-opcoes'] as const

const defaultForm: CreateRecordedServicePayload = {
  serviceId: '',
  preacher: '',
  topic: '',
  notes: '',
  date: '',
}

export function RecordedServicesPage() {
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<RecordedService | null>(null)
  const [recordToDelete, setRecordToDelete] = useState<RecordedService | null>(null)
  const [optionsMenu, setOptionsMenu] = useState<{ id: string; top: number; left: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [serviceId, setServiceId] = useState(defaultForm.serviceId)
  const [preacher, setPreacher] = useState(defaultForm.preacher)
  const [topic, setTopic] = useState(defaultForm.topic)
  const [notes, setNotes] = useState(defaultForm.notes ?? '')
  const [date, setDate] = useState(defaultForm.date)
  const [submitError, setSubmitError] = useState<ApiErrorDisplay | null>(null)
  const [validationErrors, setValidationErrors] = useState<RecordedServiceValidationErrors>({})

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<RecordedServicesData>({
    queryKey: [...RECORDED_SERVICES_QUERY_KEY, currentPage, PAGE_SIZE],
    queryFn: () => getRecordedServicesData({ page: currentPage, limit: PAGE_SIZE }),
  })
  const { data: churchServicesOptions } = useQuery<ChurchServicesData>({
    queryKey: CHURCH_SERVICES_OPTIONS_QUERY_KEY,
    queryFn: () => getChurchServicesData({ page: 1, limit: 100 }),
  })
  const canManage = hasAnyRole('ADMIN', 'SUPERVISOR', 'SUPERADMIN')

  const buildOptimisticRecord = (payload: CreateRecordedServicePayload, id: string): RecordedService => {
    const isoDate = payload.date.includes('T') ? payload.date : `${payload.date}T00:00:00.000Z`
    const recordDate = new Date(isoDate)

    return {
      id,
      serviceId: payload.serviceId,
      date: Number.isNaN(recordDate.getTime()) ? '-' : recordDate.toLocaleDateString('pt-BR'),
      isoDate,
      theme: payload.topic,
      preacher: payload.preacher,
      attendance: 0,
      visitors: 0,
      notes: payload.notes,
    }
  }

  const paginatedRecords = data?.recordedServices ?? []
  const totalItems = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const safeCurrentPage = data?.page ?? currentPage

  const optionsTargetRecord = useMemo(() => {
    if (!optionsMenu || !data) {
      return null
    }

    return data.recordedServices.find((item) => item.id === optionsMenu.id) ?? null
  }, [data, optionsMenu])

  const resetForm = () => {
    setServiceId(defaultForm.serviceId)
    setPreacher(defaultForm.preacher)
    setTopic(defaultForm.topic)
    setNotes(defaultForm.notes ?? '')
    setDate(defaultForm.date)
    setValidationErrors({})
  }

  const fillFormFromRecord = (record: RecordedService) => {
    setServiceId(record.serviceId)
    setPreacher(record.preacher)
    setTopic(record.theme)
    setNotes(record.notes ?? '')
    setDate(record.isoDate.slice(0, 10))
  }

  const createMutation = useMutation({
    mutationFn: createRecordedService,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: RECORDED_SERVICES_QUERY_KEY })

      const previousData = queryClient.getQueryData<RecordedServicesData>(RECORDED_SERVICES_QUERY_KEY)
      if (!previousData) {
        return { previousData }
      }

      const optimisticItem = buildOptimisticRecord(payload, `optimistic-${crypto.randomUUID()}`)

      queryClient.setQueryData<RecordedServicesData>(RECORDED_SERVICES_QUERY_KEY, {
        ...previousData,
        recordedServices: [optimisticItem, ...previousData.recordedServices],
      })

      return { previousData }
    },
    onError: (_error, _payload, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(RECORDED_SERVICES_QUERY_KEY, context.previousData)
      }
    },
    onSuccess: () => {
      setSubmitError(null)
      setSelectedRecord(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: RECORDED_SERVICES_QUERY_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateRecordedServicePayload }) => updateRecordedService(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: RECORDED_SERVICES_QUERY_KEY })

      const previousData = queryClient.getQueryData<RecordedServicesData>(RECORDED_SERVICES_QUERY_KEY)
      if (!previousData) {
        return { previousData }
      }

      queryClient.setQueryData<RecordedServicesData>(RECORDED_SERVICES_QUERY_KEY, {
        ...previousData,
        recordedServices: previousData.recordedServices.map((item) =>
          item.id === id
            ? {
                ...item,
                ...buildOptimisticRecord(payload, id),
              }
            : item,
        ),
      })

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(RECORDED_SERVICES_QUERY_KEY, context.previousData)
      }
    },
    onSuccess: () => {
      setSubmitError(null)
      setSelectedRecord(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: RECORDED_SERVICES_QUERY_KEY })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRecordedService,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: RECORDED_SERVICES_QUERY_KEY })

      const previousData = queryClient.getQueryData<RecordedServicesData>(RECORDED_SERVICES_QUERY_KEY)
      if (!previousData) {
        return { previousData }
      }

      queryClient.setQueryData<RecordedServicesData>(RECORDED_SERVICES_QUERY_KEY, {
        ...previousData,
        recordedServices: previousData.recordedServices.filter((item) => item.id !== id),
      })

      return { previousData }
    },
    onError: (_error, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(RECORDED_SERVICES_QUERY_KEY, context.previousData)
      }
    },
    onSuccess: () => {
      setSubmitError(null)
      setRecordToDelete(null)
      setIsDeleteConfirmOpen(false)
      setOptionsMenu(null)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: RECORDED_SERVICES_QUERY_KEY })
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const openCreateModal = () => {
    setSubmitError(null)
    setSelectedRecord(null)
    setModalMode('create')
    resetForm()
    setIsModalOpen(true)
  }

  const openViewModal = (record: RecordedService) => {
    setSubmitError(null)
    setSelectedRecord(record)
    setModalMode('view')
    fillFormFromRecord(record)
    setIsModalOpen(true)
  }

  const openEditModal = (record: RecordedService) => {
    setSubmitError(null)
    setSelectedRecord(record)
    setModalMode('edit')
    fillFormFromRecord(record)
    setOptionsMenu(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSubmitError(null)
    setSelectedRecord(null)
    setModalMode('create')
    setOptionsMenu(null)
    resetForm()
    setIsModalOpen(false)
  }

  const toggleOptionsMenu = (recordId: string, target: HTMLButtonElement) => {
    const rect = target.getBoundingClientRect()
    const menuWidth = 144
    const viewportPadding = 8
    const left = Math.min(Math.max(viewportPadding, rect.right - menuWidth), window.innerWidth - menuWidth - viewportPadding)

    setOptionsMenu((current) =>
      current?.id === recordId
        ? null
        : {
            id: recordId,
            top: rect.bottom + 8,
            left,
          },
    )
  }

  const handleSubmit = async () => {
    if (modalMode === 'view') {
      if (selectedRecord && canManage) {
        openEditModal(selectedRecord)
      }
      return
    }

    const payload: CreateRecordedServicePayload = {
      serviceId,
      preacher,
      topic,
      notes,
      date: date.includes('T') ? date : `${date}T00:00:00.000Z`,
    }

    const formErrors = validateRecordedServiceForm(payload)
    if (Object.keys(formErrors).length > 0) {
      setValidationErrors(formErrors)
      return
    }

    try {
      if (modalMode === 'edit' && selectedRecord) {
        await updateMutation.mutateAsync({ id: selectedRecord.id, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    } catch (error) {
      setSubmitError(
        parseApiError(
          error,
          modalMode === 'edit'
            ? 'Não foi possível atualizar o registro. Verifique os dados e tente novamente.'
            : 'Não foi possível criar o registro. Verifique os dados e tente novamente.',
        ),
      )
    }
  }

  const requestDelete = (record: RecordedService) => {
    setOptionsMenu(null)
    setRecordToDelete(record)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!recordToDelete) {
      return
    }

    try {
      await deleteMutation.mutateAsync(recordToDelete.id)
    } catch (error) {
      setSubmitError(parseApiError(error, 'Não foi possível excluir o registro de culto. Tente novamente.'))
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <LoadingCard key={idx} />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <EmptyState
        title="Sem registros"
        description="Quando novos registros de culto forem criados, aparecerão aqui."
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} />
        ))}
      </section>

      <section>
        <SectionHeaderAction
          title="Cultos registrados"
          description="Histórico de registros e pregações"
          canManage={canManage}
          actionLabel="Novo registro"
          actionIcon={<Plus size={16} />}
          onAction={openCreateModal}
        />

        <Table
          data={paginatedRecords}
          onRowClick={openViewModal}
          columns={[
            { key: 'date', title: 'Data' },
            { key: 'theme', title: 'Tema' },
            { key: 'preacher', title: 'Pregador' },
            { key: 'attendance', title: 'Presentes' },
            { key: 'visitors', title: 'Visitantes' },
            {
              key: 'options',
              title: 'Opções',
              render: (row) =>
                canManage ? (
                  <div className="relative" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      data-options-trigger
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleOptionsMenu(row.id, event.currentTarget)
                      }}
                      className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400">-</span>
                ),
            },
          ]}
        />

        <FloatingActionsMenu
          isOpen={Boolean(optionsMenu && optionsTargetRecord)}
          top={optionsMenu?.top ?? 0}
          left={optionsMenu?.left ?? 0}
          onClose={() => setOptionsMenu(null)}
        >
          <button
            type="button"
            onClick={() => optionsTargetRecord && openEditModal(optionsTargetRecord)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => optionsTargetRecord && requestDelete(optionsTargetRecord)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
          >
            <Trash2 size={14} />
            Excluir
          </button>
        </FloatingActionsMenu>

        <PaginationBar
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={totalItems}
          currentItems={paginatedRecords.length}
          onPrev={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
          onNext={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
        />
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title={modalMode === 'create' ? 'Novo registro de culto' : modalMode === 'edit' ? 'Editar registro de culto' : 'Detalhes do registro'}
        description={
          modalMode === 'create'
            ? 'Preencha as informações do registro.'
            : modalMode === 'edit'
              ? 'Atualize as informações do registro.'
              : 'Visualize as informações cadastradas do registro.'
        }
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modalMode === 'create' ? 'Criar registro' : modalMode === 'edit' ? 'Salvar alterações' : 'Editar'}
        cancelLabel={modalMode === 'view' ? 'Fechar' : 'Cancelar'}
        isSubmitting={isSubmitting}
      >
        {submitError ? <ErrorAlert error={submitError} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="record-service" className="text-sm font-medium text-slate-700">Culto</label>
            <select
              id="record-service"
              value={serviceId}
              onChange={(event) => {
                setServiceId(event.target.value)
                setValidationErrors((current) => ({ ...current, serviceId: undefined }))
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.serviceId ? 'border-rose-400' : 'border-slate-200'}`}
              disabled={modalMode === 'view'}
              required
            >
              <option value="">Selecione um culto</option>
              {(churchServicesOptions?.churchServices ?? []).map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.day} - {service.startsAt})
                </option>
              ))}
            </select>
            {validationErrors.serviceId ? <p className="text-xs text-rose-600">{validationErrors.serviceId}</p> : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="record-preacher" className="text-sm font-medium text-slate-700">Pregador</label>
            <input
              id="record-preacher"
              value={preacher}
              onChange={(event) => {
                setPreacher(event.target.value)
                setValidationErrors((current) => ({ ...current, preacher: undefined }))
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.preacher ? 'border-rose-400' : 'border-slate-200'}`}
              required
              disabled={modalMode === 'view'}
            />
            {validationErrors.preacher ? <p className="text-xs text-rose-600">{validationErrors.preacher}</p> : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="record-date" className="text-sm font-medium text-slate-700">Data</label>
            <input
              id="record-date"
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                setValidationErrors((current) => ({ ...current, date: undefined }))
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.date ? 'border-rose-400' : 'border-slate-200'}`}
              required
              disabled={modalMode === 'view'}
            />
            {validationErrors.date ? <p className="text-xs text-rose-600">{validationErrors.date}</p> : null}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="record-topic" className="text-sm font-medium text-slate-700">Tema</label>
            <input
              id="record-topic"
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value)
                setValidationErrors((current) => ({ ...current, topic: undefined }))
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.topic ? 'border-rose-400' : 'border-slate-200'}`}
              required
              disabled={modalMode === 'view'}
            />
            {validationErrors.topic ? <p className="text-xs text-rose-600">{validationErrors.topic}</p> : null}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="record-notes" className="text-sm font-medium text-slate-700">Observações</label>
            <textarea
              id="record-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              disabled={modalMode === 'view'}
            />
          </div>
        </div>
      </CreateUpdateModal>

      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        itemLabel="registro"
        itemName={recordToDelete?.theme ?? ''}
        isSubmitting={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setRecordToDelete(null)
            setIsDeleteConfirmOpen(false)
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
