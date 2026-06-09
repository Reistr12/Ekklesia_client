import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarPlus, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { createEvent, deleteEvent, getEventsData, updateEvent } from '../../services/api/events'
import type { CreateEventPayload, Event, EventsData } from '../../services/api/events/types'
import { parseApiError, type ApiErrorDisplay } from '../../utils/apiError'
import { openGoogleCalendarDraft } from '../../utils/googleCalendar'
import { hasAnyRole } from '../../utils/auth'

type ModalMode = 'create' | 'view' | 'edit'

const PAGE_SIZE = 10

const defaultForm: CreateEventPayload = {
  title: '',
  description: '',
  date: '',
}

export function EventsPage() {
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [optionsMenu, setOptionsMenu] = useState<{ id: string; top: number; left: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [title, setTitle] = useState(defaultForm.title)
  const [description, setDescription] = useState(defaultForm.description)
  const [date, setDate] = useState(defaultForm.date)
  const [submitError, setSubmitError] = useState<ApiErrorDisplay | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<EventsData>({ queryKey: ['eventos'], queryFn: getEventsData })
  const canManage = hasAnyRole('ADMIN', 'SUPERADMIN')

  const totalItems = data?.events.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedEvents = useMemo(() => {
    if (!data) {
      return []
    }

    const start = (safeCurrentPage - 1) * PAGE_SIZE
    return data.events.slice(start, start + PAGE_SIZE)
  }, [safeCurrentPage, data])

  const nextUpcomingEvent = useMemo(() => {
    if (!data) {
      return null
    }

    return (
      data.events
        .filter((event) => event.status === 'Scheduled')
        .sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime())[0] ?? null
    )
  }, [data])

  const optionsTargetEvent = useMemo(() => {
    if (!optionsMenu || !data) {
      return null
    }

    return data.events.find((item) => item.id === optionsMenu.id) ?? null
  }, [data, optionsMenu])

  const resetForm = () => {
    setTitle(defaultForm.title)
    setDescription(defaultForm.description)
    setDate(defaultForm.date)
  }

  const fillFormFromEvent = (event: Event) => {
    setTitle(event.name)
    setDescription(event.description)
    setDate(event.isoDate.slice(0, 10))
  }

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] })
      setSubmitError(null)
      setSelectedEvent(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateEventPayload }) => updateEvent(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] })
      setSubmitError(null)
      setSelectedEvent(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['eventos'] })
      setSubmitError(null)
      setEventToDelete(null)
      setIsDeleteConfirmOpen(false)
      setOptionsMenu(null)
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const openCreateModal = () => {
    setSubmitError(null)
    setSelectedEvent(null)
    setModalMode('create')
    resetForm()
    setIsModalOpen(true)
  }

  const openViewModal = (event: Event) => {
    setSubmitError(null)
    setSelectedEvent(event)
    setModalMode('view')
    fillFormFromEvent(event)
    setIsModalOpen(true)
  }

  const openEditModal = (event: Event) => {
    setSubmitError(null)
    setSelectedEvent(event)
    setModalMode('edit')
    fillFormFromEvent(event)
    setOptionsMenu(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSubmitError(null)
    setSelectedEvent(null)
    setModalMode('create')
    setOptionsMenu(null)
    resetForm()
    setIsModalOpen(false)
  }

  const toggleOptionsMenu = (eventId: string, target: HTMLButtonElement) => {
    const rect = target.getBoundingClientRect()
    const menuWidth = 144
    const viewportPadding = 8
    const left = Math.min(Math.max(viewportPadding, rect.right - menuWidth), window.innerWidth - menuWidth - viewportPadding)

    setOptionsMenu((current) =>
      current?.id === eventId
        ? null
        : {
            id: eventId,
            top: rect.bottom + 8,
            left,
          },
    )
  }

  const handleSubmit = async () => {
    if (modalMode === 'view') {
      if (selectedEvent && canManage) {
        openEditModal(selectedEvent)
      }
      return
    }

    const payload: CreateEventPayload = {
      title,
      description,
      date: date.includes('T') ? date : `${date}T00:00:00.000Z`,
    }

    try {
      if (modalMode === 'edit' && selectedEvent) {
        await updateMutation.mutateAsync({ id: selectedEvent.id, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    } catch (error) {
      setSubmitError(
        parseApiError(
          error,
          modalMode === 'edit'
            ? 'Não foi possível atualizar o evento. Verifique os dados e tente novamente.'
            : 'Não foi possível criar o evento. Verifique os dados e tente novamente.',
        ),
      )
    }
  }

  const requestDelete = (event: Event) => {
    setOptionsMenu(null)
    setEventToDelete(event)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!eventToDelete) {
      return
    }

    try {
      await deleteMutation.mutateAsync(eventToDelete.id)
    } catch (error) {
      setSubmitError(parseApiError(error, 'Não foi possível excluir o evento. Tente novamente.'))
    }
  }

  const handleGoogleCalendarLink = () => {
    if (!nextUpcomingEvent) {
      return
    }

    openGoogleCalendarDraft({
      title: nextUpcomingEvent.name,
      description: nextUpcomingEvent.description,
      startDate: nextUpcomingEvent.isoDate,
      location: `Igreja - ${nextUpcomingEvent.category}`,
    })
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
    return <EmptyState title="Sem eventos" description="Quando novos eventos forem criados, aparecerão aqui." />
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
          title="Pipeline de eventos"
          description="Gestão de campanhas e encontros"
          canManage={canManage}
          secondaryActionLabel="Vincular com Google Agenda"
          secondaryActionIcon={<CalendarPlus size={16} />}
          onSecondaryAction={handleGoogleCalendarLink}
          secondaryActionDisabled={!nextUpcomingEvent}
          actionLabel="Novo evento"
          actionIcon={<Plus size={16} />}
          onAction={openCreateModal}
        />

        <Table
          data={paginatedEvents}
          onRowClick={openViewModal}
          columns={[
            { key: 'name', title: 'Evento' },
            { key: 'date', title: 'Data' },
            { key: 'attendees', title: 'Inscritos' },
            { key: 'category', title: 'Categoria' },
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
          isOpen={Boolean(optionsMenu && optionsTargetEvent)}
          top={optionsMenu?.top ?? 0}
          left={optionsMenu?.left ?? 0}
          onClose={() => setOptionsMenu(null)}
        >
          <button
            type="button"
            onClick={() => optionsTargetEvent && openEditModal(optionsTargetEvent)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => optionsTargetEvent && requestDelete(optionsTargetEvent)}
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
          currentItems={paginatedEvents.length}
          onPrev={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
          onNext={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
        />
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title={modalMode === 'create' ? 'Novo evento' : modalMode === 'edit' ? 'Editar evento' : 'Detalhes do evento'}
        description={
          modalMode === 'create'
            ? 'Preencha as informações do evento.'
            : modalMode === 'edit'
              ? 'Atualize as informações do evento.'
              : 'Visualize as informações cadastradas do evento.'
        }
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modalMode === 'create' ? 'Criar evento' : modalMode === 'edit' ? 'Salvar alterações' : 'Editar'}
        cancelLabel={modalMode === 'view' ? 'Fechar' : 'Cancelar'}
        isSubmitting={isSubmitting}
      >
        {submitError ? <ErrorAlert error={submitError} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="event-name" className="text-sm font-medium text-slate-700">Nome</label>
            <input
              id="event-name"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="event-description" className="text-sm font-medium text-slate-700">Descrição</label>
            <textarea
              id="event-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="event-date" className="text-sm font-medium text-slate-700">Data</label>
            <input
              id="event-date"
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
        itemLabel="evento"
        itemName={eventToDelete?.name ?? ''}
        isSubmitting={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setEventToDelete(null)
            setIsDeleteConfirmOpen(false)
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
