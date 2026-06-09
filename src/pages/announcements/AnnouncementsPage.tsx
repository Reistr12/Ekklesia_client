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
import { createAnnouncement, deleteAnnouncement, getAnnouncementsData, updateAnnouncement } from '../../services/api/announcements'
import type { Announcement, AnnouncementsData, CreateAnnouncementPayload } from '../../services/api/announcements/types'
import { parseApiError, type ApiErrorDisplay } from '../../utils/apiError'
import { hasAnyRole } from '../../utils/auth'

type ModalMode = 'create' | 'view' | 'edit'

const PAGE_SIZE = 10

const defaultForm: CreateAnnouncementPayload = {
  title: '',
  content: '',
  date: '',
}

export function AnnouncementsPage() {
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null)
  const [optionsMenu, setOptionsMenu] = useState<{ id: string; top: number; left: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [title, setTitle] = useState(defaultForm.title)
  const [content, setContent] = useState(defaultForm.content)
  const [date, setDate] = useState(defaultForm.date)
  const [submitError, setSubmitError] = useState<ApiErrorDisplay | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<AnnouncementsData>({ queryKey: ['comunicados'], queryFn: getAnnouncementsData })
  const canManage = hasAnyRole('ADMIN', 'SUPERVISOR', 'SUPERADMIN')

  const totalItems = data?.announcements.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedAnnouncements = useMemo(() => {
    if (!data) {
      return []
    }

    const start = (safeCurrentPage - 1) * PAGE_SIZE
    return data.announcements.slice(start, start + PAGE_SIZE)
  }, [safeCurrentPage, data])

  const optionsTargetAnnouncement = useMemo(() => {
    if (!optionsMenu || !data) {
      return null
    }

    return data.announcements.find((item) => item.id === optionsMenu.id) ?? null
  }, [data, optionsMenu])

  const resetForm = () => {
    setTitle(defaultForm.title)
    setContent(defaultForm.content)
    setDate(defaultForm.date)
  }

  const fillFormFromAnnouncement = (announcement: Announcement) => {
    setTitle(announcement.title)
    setContent(announcement.content)
    setDate(announcement.isoDate.slice(0, 10))
  }

  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comunicados'] })
      setSubmitError(null)
      setSelectedAnnouncement(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateAnnouncementPayload }) => updateAnnouncement(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comunicados'] })
      setSubmitError(null)
      setSelectedAnnouncement(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comunicados'] })
      setSubmitError(null)
      setAnnouncementToDelete(null)
      setIsDeleteConfirmOpen(false)
      setOptionsMenu(null)
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const openCreateModal = () => {
    setSubmitError(null)
    setSelectedAnnouncement(null)
    setModalMode('create')
    resetForm()
    setIsModalOpen(true)
  }

  const openViewModal = (announcement: Announcement) => {
    setSubmitError(null)
    setSelectedAnnouncement(announcement)
    setModalMode('view')
    fillFormFromAnnouncement(announcement)
    setIsModalOpen(true)
  }

  const openEditModal = (announcement: Announcement) => {
    setSubmitError(null)
    setSelectedAnnouncement(announcement)
    setModalMode('edit')
    fillFormFromAnnouncement(announcement)
    setOptionsMenu(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSubmitError(null)
    setSelectedAnnouncement(null)
    setModalMode('create')
    setOptionsMenu(null)
    resetForm()
    setIsModalOpen(false)
  }

  const toggleOptionsMenu = (announcementId: string, target: HTMLButtonElement) => {
    const rect = target.getBoundingClientRect()
    const menuWidth = 144
    const viewportPadding = 8
    const left = Math.min(Math.max(viewportPadding, rect.right - menuWidth), window.innerWidth - menuWidth - viewportPadding)

    setOptionsMenu((current) =>
      current?.id === announcementId
        ? null
        : {
            id: announcementId,
            top: rect.bottom + 8,
            left,
          },
    )
  }

  const handleSubmit = async () => {
    if (modalMode === 'view') {
      if (selectedAnnouncement && canManage) {
        openEditModal(selectedAnnouncement)
      }
      return
    }

    const payload: CreateAnnouncementPayload = {
      title,
      content,
      date: date.includes('T') ? date : `${date}T00:00:00.000Z`,
    }

    try {
      if (modalMode === 'edit' && selectedAnnouncement) {
        await updateMutation.mutateAsync({ id: selectedAnnouncement.id, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    } catch (error) {
      setSubmitError(
        parseApiError(
          error,
          modalMode === 'edit'
            ? 'Não foi possível atualizar o comunicado. Verifique os dados e tente novamente.'
            : 'Não foi possível criar o comunicado. Verifique os dados e tente novamente.',
        ),
      )
    }
  }

  const requestDelete = (announcement: Announcement) => {
    setOptionsMenu(null)
    setAnnouncementToDelete(announcement)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!announcementToDelete) {
      return
    }

    try {
      await deleteMutation.mutateAsync(announcementToDelete.id)
    } catch (error) {
      setSubmitError(parseApiError(error, 'Não foi possível excluir o comunicado. Tente novamente.'))
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
    return <EmptyState title="Sem comunicados" description="Quando novos comunicados forem criados, aparecerão aqui." />
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
          title="Comunicados"
          description="Publicações e avisos da comunidade"
          canManage={canManage}
          actionLabel="Novo comunicado"
          actionIcon={<Plus size={16} />}
          onAction={openCreateModal}
        />

        <Table
          data={paginatedAnnouncements}
          onRowClick={openViewModal}
          columns={[
            { key: 'title', title: 'Título' },
            { key: 'channel', title: 'Canal' },
            { key: 'reach', title: 'Alcance' },
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
          isOpen={Boolean(optionsMenu && optionsTargetAnnouncement)}
          top={optionsMenu?.top ?? 0}
          left={optionsMenu?.left ?? 0}
          onClose={() => setOptionsMenu(null)}
        >
          <button
            type="button"
            onClick={() => optionsTargetAnnouncement && openEditModal(optionsTargetAnnouncement)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => optionsTargetAnnouncement && requestDelete(optionsTargetAnnouncement)}
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
          currentItems={paginatedAnnouncements.length}
          onPrev={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
          onNext={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
        />
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title={modalMode === 'create' ? 'Novo comunicado' : modalMode === 'edit' ? 'Editar comunicado' : 'Detalhes do comunicado'}
        description={
          modalMode === 'create'
            ? 'Preencha as informações do comunicado.'
            : modalMode === 'edit'
              ? 'Atualize as informações do comunicado.'
              : 'Visualize as informações cadastradas do comunicado.'
        }
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modalMode === 'create' ? 'Criar comunicado' : modalMode === 'edit' ? 'Salvar alterações' : 'Editar'}
        cancelLabel={modalMode === 'view' ? 'Fechar' : 'Cancelar'}
        isSubmitting={isSubmitting}
      >
        {submitError ? <ErrorAlert error={submitError} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="announcement-title" className="text-sm font-medium text-slate-700">Título</label>
            <input
              id="announcement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="announcement-content" className="text-sm font-medium text-slate-700">Conteúdo</label>
            <textarea
              id="announcement-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="announcement-date" className="text-sm font-medium text-slate-700">Data</label>
            <input
              id="announcement-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>
        </div>
      </CreateUpdateModal>

      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        itemLabel="comunicado"
        itemName={announcementToDelete?.title ?? ''}
        isSubmitting={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setAnnouncementToDelete(null)
            setIsDeleteConfirmOpen(false)
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
