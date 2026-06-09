import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { ChurchServiceFormFields } from '../../components/church-services/ChurchServiceFormFields'
import { ChurchServicesSectionHeader } from '../../components/church-services/ChurchServicesSectionHeader'
import { ChurchServicesTable } from '../../components/church-services/ChurchServicesTable'
import { ErrorAlert } from '../../components/feedback/ErrorAlert'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingCard } from '../../components/feedback/LoadingCard'
import { CreateUpdateModal } from '../../components/ui/CreateUpdateModal'
import { FloatingActionsMenu } from '../../components/ui/FloatingActionsMenu'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { StatCard } from '../../components/ui/StatCard'
import {
  createChurchService,
  deleteChurchService,
  getChurchServicesData,
  updateChurchService,
} from '../../services/api/church-services'
import type {
  ChurchService,
  ChurchServicesData,
  CreateChurchServicePayload,
} from '../../services/api/church-services/types'
import { parseApiError, type ApiErrorDisplay } from '../../utils/apiError'
import { isChurchAdmin } from '../../utils/auth'
import {
  type ChurchServiceValidationErrors,
  validateChurchServiceForm,
} from './validations/validation'

type ModalMode = 'create' | 'view' | 'edit'
const PAGE_SIZE = 10

const defaultForm: CreateChurchServicePayload = {
  title: '',
  description: '',
  day: 'SUNDAY',
  startsAt: '',
  endsAt: '',
  isOnline: false,
  streamUrl: undefined,
}

export function ChurchServicesPage() {
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ChurchService | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<ChurchService | null>(null)
  const [optionsMenu, setOptionsMenu] = useState<{ id: string; top: number; left: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [serviceTitle, setServiceTitle] = useState(defaultForm.title)
  const [serviceDescription, setServiceDescription] = useState(defaultForm.description)
  const [serviceDay, setServiceDay] = useState<CreateChurchServicePayload['day']>(defaultForm.day)
  const [startsAt, setStartsAt] = useState(defaultForm.startsAt)
  const [endsAt, setEndsAt] = useState(defaultForm.endsAt)
  const [streamUrl, setStreamUrl] = useState(defaultForm.streamUrl ?? '')
  const [submitError, setSubmitError] = useState<ApiErrorDisplay | null>(null)
  const [validationErrors, setValidationErrors] = useState<ChurchServiceValidationErrors>({})
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<ChurchServicesData>({ queryKey: ['cultos'], queryFn: getChurchServicesData })
  const canManageChurchServices = isChurchAdmin()

  const totalItems = data?.churchServices.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedChurchServices = useMemo(() => {
    if (!data) {
      return []
    }

    const start = (safeCurrentPage - 1) * PAGE_SIZE
    return data.churchServices.slice(start, start + PAGE_SIZE)
  }, [safeCurrentPage, data])

  const optionsTargetService = useMemo(() => {
    if (!optionsMenu || !data) {
      return null
    }

    return data.churchServices.find((service) => service.id === optionsMenu.id) ?? null
  }, [data, optionsMenu])

  const resetForm = () => {
    setServiceTitle(defaultForm.title)
    setServiceDescription(defaultForm.description)
    setServiceDay(defaultForm.day)
    setStartsAt(defaultForm.startsAt)
    setEndsAt(defaultForm.endsAt)
    setStreamUrl(defaultForm.streamUrl ?? '')
    setValidationErrors({})
  }

  const fillFormFromService = (service: ChurchService) => {
    setServiceTitle(service.name)
    setServiceDescription(service.description)
    setServiceDay(service.dayCode)
    setStartsAt(service.startsAt)
    setEndsAt(service.endsAt)
    setStreamUrl(service.streamUrl ?? '')
  }

  const createChurchServiceMutation = useMutation({
    mutationFn: createChurchService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cultos'] })
      setSubmitError(null)
      resetForm()
      setSelectedService(null)
      setModalMode('create')
      setIsModalOpen(false)
    },
  })

  const updateChurchServiceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateChurchServicePayload }) =>
      updateChurchService(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cultos'] })
      setSubmitError(null)
      setSelectedService(null)
      resetForm()
      setModalMode('create')
      setIsModalOpen(false)
    },
  })

  const deleteChurchServiceMutation = useMutation({
    mutationFn: deleteChurchService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cultos'] })
      setSubmitError(null)
      setSelectedService(null)
      setServiceToDelete(null)
      setIsDeleteConfirmOpen(false)
      resetForm()
      setModalMode('create')
      setIsModalOpen(false)
    },
  })

  const isSubmitting =
    createChurchServiceMutation.isPending ||
    updateChurchServiceMutation.isPending ||
    deleteChurchServiceMutation.isPending

  const openCreateModal = () => {
    resetForm()
    setSubmitError(null)
    setSelectedService(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const openViewModal = (service: ChurchService) => {
    fillFormFromService(service)
    setSubmitError(null)
    setSelectedService(service)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const openEditModal = (service: ChurchService) => {
    fillFormFromService(service)
    setSubmitError(null)
    setSelectedService(service)
    setOptionsMenu(null)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteService = async (service: ChurchService) => {
    setSubmitError(null)
    setOptionsMenu(null)

    setServiceToDelete(service)
    setIsDeleteConfirmOpen(true)
  }

  const handleCloseDeleteConfirmModal = () => {
    if (deleteChurchServiceMutation.isPending) {
      return
    }

    setServiceToDelete(null)
    setIsDeleteConfirmOpen(false)
  }

  const handleConfirmDeleteService = async () => {
    if (!serviceToDelete) {
      return
    }

    try {
      await deleteChurchServiceMutation.mutateAsync(serviceToDelete.id)
    } catch (error) {
      setSubmitError(parseApiError(error, 'Não foi possível excluir o culto. Tente novamente.'))
    }
  }

  const handleCloseModal = () => {
    setSubmitError(null)
    setModalMode('create')
    setSelectedService(null)
    setOptionsMenu(null)
    resetForm()
    setIsModalOpen(false)
  }

  const toggleOptionsMenu = (serviceId: string, target: HTMLButtonElement) => {
    const rect = target.getBoundingClientRect()
    const menuWidth = 144
    const viewportPadding = 8
    const left = Math.min(
      Math.max(viewportPadding, rect.right - menuWidth),
      window.innerWidth - menuWidth - viewportPadding,
    )
    const top = rect.bottom + 8

    setOptionsMenu((current) => (current?.id === serviceId ? null : { id: serviceId, top, left }))
  }

  const handleCreateChurchService = async () => {
    const payload: CreateChurchServicePayload = {
      title: serviceTitle,
      description: serviceDescription,
      day: serviceDay,
      startsAt,
      endsAt,
      isOnline: Boolean(streamUrl.trim()),
      streamUrl: streamUrl.trim() || undefined,
    }

    if (modalMode === 'view') {
      if (selectedService && canManageChurchServices) {
        openEditModal(selectedService)
      }
      return
    }

    const formErrors = validateChurchServiceForm(payload)
    if (Object.keys(formErrors).length > 0) {
      setValidationErrors(formErrors)
      return
    }

    try {
      if (modalMode === 'edit' && selectedService) {
        await updateChurchServiceMutation.mutateAsync({ id: selectedService.id, payload })
      } else {
        await createChurchServiceMutation.mutateAsync(payload)
      }
    } catch (error) {
      setSubmitError(
        parseApiError(
          error,
          modalMode === 'edit'
            ? 'Não foi possível atualizar o culto. Verifique os dados e tente novamente.'
            : 'Não foi possível criar o culto. Verifique os dados e tente novamente.',
        ),
      )
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
    return <EmptyState title="Sem cultos" description="Não existem cultos agendados no momento." />
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} />
        ))}
      </section>

      <section>
        <ChurchServicesSectionHeader canManage={canManageChurchServices} onCreate={openCreateModal} />

        <ChurchServicesTable
          data={paginatedChurchServices}
          canManage={canManageChurchServices}
          onRowClick={openViewModal}
          onToggleOptions={toggleOptionsMenu}
        />

        <FloatingActionsMenu
          isOpen={Boolean(optionsMenu && optionsTargetService)}
          top={optionsMenu?.top ?? 0}
          left={optionsMenu?.left ?? 0}
          onClose={() => setOptionsMenu(null)}
        >
          <button
            type="button"
            onClick={() => optionsTargetService && openEditModal(optionsTargetService)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => optionsTargetService && handleDeleteService(optionsTargetService)}
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
          currentItems={paginatedChurchServices.length}
          onPrev={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
          onNext={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
        />
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title={modalMode === 'create' ? 'Novo culto' : modalMode === 'edit' ? 'Editar culto' : 'Detalhes do culto'}
        description={
          modalMode === 'create'
            ? 'Preencha as informações para criar um culto.'
            : modalMode === 'edit'
              ? 'Atualize as informações do culto.'
              : 'Visualize as informações cadastradas do culto.'
        }
        onClose={handleCloseModal}
        onSubmit={handleCreateChurchService}
        submitLabel={modalMode === 'create' ? 'Criar culto' : modalMode === 'edit' ? 'Salvar alterações' : 'Editar'}
        cancelLabel={modalMode === 'view' ? 'Fechar' : 'Cancelar'}
        isSubmitting={isSubmitting}
      >
        {submitError ? <ErrorAlert error={submitError} /> : null}

        <ChurchServiceFormFields
          title={serviceTitle}
          description={serviceDescription}
          day={serviceDay}
          streamUrl={streamUrl}
          startsAt={startsAt}
          endsAt={endsAt}
          readOnly={modalMode === 'view'}
          onTitleChange={(value) => {
            setServiceTitle(value)
            setValidationErrors((current) => ({ ...current, title: undefined }))
          }}
          onDescriptionChange={(value) => {
            setServiceDescription(value)
            setValidationErrors((current) => ({ ...current, description: undefined }))
          }}
          onDayChange={(value) => {
            setServiceDay(value)
            setValidationErrors((current) => ({ ...current, day: undefined }))
          }}
          onStreamUrlChange={setStreamUrl}
          onStartsAtChange={(value) => {
            setStartsAt(value)
            setValidationErrors((current) => ({ ...current, startsAt: undefined }))
          }}
          onEndsAtChange={(value) => {
            setEndsAt(value)
            setValidationErrors((current) => ({ ...current, endsAt: undefined }))
          }}
          errors={validationErrors}
        />
      </CreateUpdateModal>

      <CreateUpdateModal
        isOpen={isDeleteConfirmOpen}
        title="Confirmar exclusão"
        description="Essa ação não pode ser desfeita."
        onClose={handleCloseDeleteConfirmModal}
        onSubmit={handleConfirmDeleteService}
        submitLabel="Excluir culto"
        cancelLabel="Cancelar"
        isSubmitting={deleteChurchServiceMutation.isPending}
        widthClassName="max-w-md"
      >
        <div className="space-y-2">
          <p className="text-sm text-slate-700">
            Tem certeza que deseja excluir o culto{' '}
            <span className="font-semibold text-slate-900">{serviceToDelete?.name ?? '-'}</span>?
          </p>
          <p className="text-sm text-rose-700">Ao confirmar, o culto será removido permanentemente.</p>
        </div>
      </CreateUpdateModal>
    </div>
  )
}
