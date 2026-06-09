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

type ModalMode = 'create' | 'view' | 'edit'

const PAGE_SIZE = 10

const defaultForm: CreateRecordedServicePayload = {
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

  const [preacher, setPreacher] = useState(defaultForm.preacher)
  const [topic, setTopic] = useState(defaultForm.topic)
  const [notes, setNotes] = useState(defaultForm.notes ?? '')
  const [date, setDate] = useState(defaultForm.date)
  const [submitError, setSubmitError] = useState<ApiErrorDisplay | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<RecordedServicesData>({
    queryKey: ['cultos-gravados'],
    queryFn: getRecordedServicesData,
  })
  const canManage = hasAnyRole('ADMIN', 'SUPERVISOR', 'SUPERADMIN')

  const totalItems = data?.recordedServices.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedRecords = useMemo(() => {
    if (!data) {
      return []
    }

    const start = (safeCurrentPage - 1) * PAGE_SIZE
    return data.recordedServices.slice(start, start + PAGE_SIZE)
  }, [safeCurrentPage, data])

  const optionsTargetRecord = useMemo(() => {
    if (!optionsMenu || !data) {
      return null
    }

    return data.recordedServices.find((item) => item.id === optionsMenu.id) ?? null
  }, [data, optionsMenu])

  const resetForm = () => {
    setPreacher(defaultForm.preacher)
    setTopic(defaultForm.topic)
    setNotes(defaultForm.notes ?? '')
    setDate(defaultForm.date)
  }

  const fillFormFromRecord = (record: RecordedService) => {
    setPreacher(record.preacher)
    setTopic(record.theme)
    setNotes(record.notes ?? '')
    setDate(record.isoDate.slice(0, 10))
  }

  const createMutation = useMutation({
    mutationFn: createRecordedService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cultos-gravados'] })
      setSubmitError(null)
      setSelectedRecord(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateRecordedServicePayload }) => updateRecordedService(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cultos-gravados'] })
      setSubmitError(null)
      setSelectedRecord(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRecordedService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cultos-gravados'] })
      setSubmitError(null)
      setRecordToDelete(null)
      setIsDeleteConfirmOpen(false)
      setOptionsMenu(null)
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
      preacher,
      topic,
      notes,
      date: date.includes('T') ? date : `${date}T00:00:00.000Z`,
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
          <div className="space-y-1">
            <label htmlFor="record-preacher" className="text-sm font-medium text-slate-700">Pregador</label>
            <input
              id="record-preacher"
              value={preacher}
              onChange={(event) => setPreacher(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="record-date" className="text-sm font-medium text-slate-700">Data</label>
            <input
              id="record-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="record-topic" className="text-sm font-medium text-slate-700">Tema</label>
            <input
              id="record-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
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
