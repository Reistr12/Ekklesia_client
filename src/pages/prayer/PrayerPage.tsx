import { useEffect, useMemo, useState } from 'react'
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
import { createPrayer, deletePrayer, getPrayerData, updatePrayer } from '../../services/api/prayer'
import type { CreatePrayerPayload, PrayerData, PrayerEntry } from '../../services/api/prayer/types'
import { parseApiError, type ApiErrorDisplay } from '../../utils/apiError'
import { hasAnyRole } from '../../utils/auth'

type ModalMode = 'create' | 'view' | 'edit'

const PAGE_SIZE = 10

const defaultForm: CreatePrayerPayload = {
  name: '',
  request: '',
}

export function PrayerPage() {
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerEntry | null>(null)
  const [prayerToDelete, setPrayerToDelete] = useState<PrayerEntry | null>(null)
  const [optionsMenu, setOptionsMenu] = useState<{ id: string; top: number; left: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [name, setName] = useState(defaultForm.name)
  const [request, setRequest] = useState(defaultForm.request)
  const [submitError, setSubmitError] = useState<ApiErrorDisplay | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<PrayerData>({ queryKey: ['oracao'], queryFn: getPrayerData })
  const canManage = hasAnyRole('ADMIN', 'SUPERVISOR', 'SUPERADMIN')

  const totalItems = data?.prayers.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedPrayers = useMemo(() => {
    if (!data) {
      return []
    }

    const start = (currentPage - 1) * PAGE_SIZE
    return data.prayers.slice(start, start + PAGE_SIZE)
  }, [currentPage, data])

  const optionsTargetPrayer = useMemo(() => {
    if (!optionsMenu || !data) {
      return null
    }

    return data.prayers.find((item) => item.id === optionsMenu.id) ?? null
  }, [data, optionsMenu])

  const resetForm = () => {
    setName(defaultForm.name)
    setRequest(defaultForm.request)
  }

  const fillFormFromPrayer = (prayer: PrayerEntry) => {
    setName(prayer.name)
    setRequest(prayer.request)
  }

  const createMutation = useMutation({
    mutationFn: createPrayer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['oracao'] })
      setSubmitError(null)
      setSelectedPrayer(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreatePrayerPayload }) => updatePrayer(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['oracao'] })
      setSubmitError(null)
      setSelectedPrayer(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePrayer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['oracao'] })
      setSubmitError(null)
      setPrayerToDelete(null)
      setIsDeleteConfirmOpen(false)
      setOptionsMenu(null)
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const openCreateModal = () => {
    setSubmitError(null)
    setSelectedPrayer(null)
    setModalMode('create')
    resetForm()
    setIsModalOpen(true)
  }

  const openViewModal = (prayer: PrayerEntry) => {
    setSubmitError(null)
    setSelectedPrayer(prayer)
    setModalMode('view')
    fillFormFromPrayer(prayer)
    setIsModalOpen(true)
  }

  const openEditModal = (prayer: PrayerEntry) => {
    setSubmitError(null)
    setSelectedPrayer(prayer)
    setModalMode('edit')
    fillFormFromPrayer(prayer)
    setOptionsMenu(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSubmitError(null)
    setSelectedPrayer(null)
    setModalMode('create')
    setOptionsMenu(null)
    resetForm()
    setIsModalOpen(false)
  }

  const toggleOptionsMenu = (prayerId: string, target: HTMLButtonElement) => {
    const rect = target.getBoundingClientRect()
    const menuWidth = 144
    const viewportPadding = 8
    const left = Math.min(Math.max(viewportPadding, rect.right - menuWidth), window.innerWidth - menuWidth - viewportPadding)

    setOptionsMenu((current) =>
      current?.id === prayerId
        ? null
        : {
            id: prayerId,
            top: rect.bottom + 8,
            left,
          },
    )
  }

  const handleSubmit = async () => {
    if (modalMode === 'view') {
      if (selectedPrayer && canManage) {
        openEditModal(selectedPrayer)
      }
      return
    }

    const payload: CreatePrayerPayload = {
      name,
      request,
    }

    try {
      if (modalMode === 'edit' && selectedPrayer) {
        await updateMutation.mutateAsync({ id: selectedPrayer.id, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    } catch (error) {
      setSubmitError(
        parseApiError(
          error,
          modalMode === 'edit'
            ? 'Não foi possível atualizar o pedido. Verifique os dados e tente novamente.'
            : 'Não foi possível criar o pedido. Verifique os dados e tente novamente.',
        ),
      )
    }
  }

  const requestDelete = (prayer: PrayerEntry) => {
    setOptionsMenu(null)
    setPrayerToDelete(prayer)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!prayerToDelete) {
      return
    }

    try {
      await deleteMutation.mutateAsync(prayerToDelete.id)
    } catch (error) {
      setSubmitError(parseApiError(error, 'Não foi possível excluir o pedido de oração. Tente novamente.'))
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
    return <EmptyState title="Sem pedidos" description="Quando novos pedidos de oração forem criados, aparecerão aqui." />
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
          title="Pedidos de oração"
          description="Acompanhe intenções e acompanhamento pastoral"
          canManage={canManage}
          actionLabel="Novo pedido"
          actionIcon={<Plus size={16} />}
          onAction={openCreateModal}
        />

        <Table
          data={paginatedPrayers}
          onRowClick={openViewModal}
          columns={[
            { key: 'name', title: 'Nome' },
            { key: 'request', title: 'Pedido' },
            { key: 'date', title: 'Data' },
            { key: 'status', title: 'Status' },
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
          isOpen={Boolean(optionsMenu && optionsTargetPrayer)}
          top={optionsMenu?.top ?? 0}
          left={optionsMenu?.left ?? 0}
          onClose={() => setOptionsMenu(null)}
        >
          <button
            type="button"
            onClick={() => optionsTargetPrayer && openEditModal(optionsTargetPrayer)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => optionsTargetPrayer && requestDelete(optionsTargetPrayer)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
          >
            <Trash2 size={14} />
            Excluir
          </button>
        </FloatingActionsMenu>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={totalItems}
          currentItems={paginatedPrayers.length}
          onPrev={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        />
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title={modalMode === 'create' ? 'Novo pedido de oração' : modalMode === 'edit' ? 'Editar pedido de oração' : 'Detalhes do pedido de oração'}
        description={
          modalMode === 'create'
            ? 'Preencha as informações do pedido.'
            : modalMode === 'edit'
              ? 'Atualize as informações do pedido.'
              : 'Visualize as informações cadastradas do pedido.'
        }
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modalMode === 'create' ? 'Criar pedido' : modalMode === 'edit' ? 'Salvar alterações' : 'Editar'}
        cancelLabel={modalMode === 'view' ? 'Fechar' : 'Cancelar'}
        isSubmitting={isSubmitting}
      >
        {submitError ? <ErrorAlert error={submitError} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="prayer-name" className="text-sm font-medium text-slate-700">Nome</label>
            <input
              id="prayer-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="prayer-request" className="text-sm font-medium text-slate-700">Pedido</label>
            <textarea
              id="prayer-request"
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>
        </div>
      </CreateUpdateModal>

      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        itemLabel="pedido de oração"
        itemName={prayerToDelete?.name ?? ''}
        isSubmitting={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setPrayerToDelete(null)
            setIsDeleteConfirmOpen(false)
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
