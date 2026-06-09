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
import { createMember, deleteMember, getMembersData, updateMember } from '../../services/api/members'
import type { CreateMemberPayload, Member, MembersData } from '../../services/api/members/types'
import { parseApiError, type ApiErrorDisplay } from '../../utils/apiError'
import { hasAnyRole } from '../../utils/auth'

type ModalMode = 'create' | 'view' | 'edit'

const PAGE_SIZE = 10

const defaultForm: CreateMemberPayload = {
  name: '',
  phone: '',
  dateOfBirth: '',
}

export function MembersPage() {
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [optionsMenu, setOptionsMenu] = useState<{ id: string; top: number; left: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [name, setName] = useState(defaultForm.name)
  const [phone, setPhone] = useState(defaultForm.phone)
  const [dateOfBirth, setDateOfBirth] = useState(defaultForm.dateOfBirth)
  const [submitError, setSubmitError] = useState<ApiErrorDisplay | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<MembersData>({ queryKey: ['membros'], queryFn: getMembersData })
  const canManage = hasAnyRole('ADMIN', 'SUPERVISOR', 'SUPERADMIN')

  const totalItems = data?.members.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedMembers = useMemo(() => {
    if (!data) {
      return []
    }

    const start = (safeCurrentPage - 1) * PAGE_SIZE
    return data.members.slice(start, start + PAGE_SIZE)
  }, [safeCurrentPage, data])

  const optionsTargetMember = useMemo(() => {
    if (!optionsMenu || !data) {
      return null
    }

    return data.members.find((item) => item.id === optionsMenu.id) ?? null
  }, [data, optionsMenu])

  const resetForm = () => {
    setName(defaultForm.name)
    setPhone(defaultForm.phone)
    setDateOfBirth(defaultForm.dateOfBirth)
  }

  const fillFormFromMember = (member: Member) => {
    setName(member.name)
    setPhone(member.phone)
    setDateOfBirth(member.dateOfBirthIso.slice(0, 10))
  }

  const createMutation = useMutation({
    mutationFn: createMember,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['membros'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
      setSubmitError(null)
      setSelectedMember(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateMemberPayload }) => updateMember(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['membros'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
      setSubmitError(null)
      setSelectedMember(null)
      setModalMode('create')
      resetForm()
      setIsModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['membros'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
      setSubmitError(null)
      setMemberToDelete(null)
      setIsDeleteConfirmOpen(false)
      setOptionsMenu(null)
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const openCreateModal = () => {
    setSubmitError(null)
    setSelectedMember(null)
    setModalMode('create')
    resetForm()
    setIsModalOpen(true)
  }

  const openViewModal = (member: Member) => {
    setSubmitError(null)
    setSelectedMember(member)
    setModalMode('view')
    fillFormFromMember(member)
    setIsModalOpen(true)
  }

  const openEditModal = (member: Member) => {
    setSubmitError(null)
    setSelectedMember(member)
    setModalMode('edit')
    fillFormFromMember(member)
    setOptionsMenu(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSubmitError(null)
    setSelectedMember(null)
    setModalMode('create')
    setOptionsMenu(null)
    resetForm()
    setIsModalOpen(false)
  }

  const toggleOptionsMenu = (memberId: string, target: HTMLButtonElement) => {
    const rect = target.getBoundingClientRect()
    const menuWidth = 144
    const viewportPadding = 8
    const left = Math.min(Math.max(viewportPadding, rect.right - menuWidth), window.innerWidth - menuWidth - viewportPadding)

    setOptionsMenu((current) =>
      current?.id === memberId
        ? null
        : {
            id: memberId,
            top: rect.bottom + 8,
            left,
          },
    )
  }

  const handleSubmit = async () => {
    if (modalMode === 'view') {
      if (selectedMember && canManage) {
        openEditModal(selectedMember)
      }
      return
    }

    const payload: CreateMemberPayload = {
      name,
      phone,
      dateOfBirth,
    }

    try {
      if (modalMode === 'edit' && selectedMember) {
        await updateMutation.mutateAsync({ id: selectedMember.id, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    } catch (error) {
      setSubmitError(
        parseApiError(
          error,
          modalMode === 'edit'
            ? 'Não foi possível atualizar o membro. Verifique os dados e tente novamente.'
            : 'Não foi possível criar o membro. Verifique os dados e tente novamente.',
        ),
      )
    }
  }

  const requestDelete = (member: Member) => {
    setOptionsMenu(null)
    setMemberToDelete(member)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!memberToDelete) {
      return
    }

    try {
      await deleteMutation.mutateAsync(memberToDelete.id)
    } catch (error) {
      setSubmitError(parseApiError(error, 'Não foi possível excluir o membro. Tente novamente.'))
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
    return <EmptyState title="Sem membros" description="Quando novos membros forem cadastrados, aparecerão aqui." />
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
          title="Gestão de membros"
          description="Acompanhe cadastro e engajamento da membresia"
          canManage={canManage}
          actionLabel="Novo membro"
          actionIcon={<Plus size={16} />}
          onAction={openCreateModal}
        />

        <Table
          data={paginatedMembers}
          onRowClick={openViewModal}
          columns={[
            { key: 'name', title: 'Nome' },
            { key: 'phone', title: 'Telefone' },
            { key: 'dateOfBirth', title: 'Nascimento' },
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
          isOpen={Boolean(optionsMenu && optionsTargetMember)}
          top={optionsMenu?.top ?? 0}
          left={optionsMenu?.left ?? 0}
          onClose={() => setOptionsMenu(null)}
        >
          <button
            type="button"
            onClick={() => optionsTargetMember && openEditModal(optionsTargetMember)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => optionsTargetMember && requestDelete(optionsTargetMember)}
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
          currentItems={paginatedMembers.length}
          onPrev={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
          onNext={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
        />
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title={modalMode === 'create' ? 'Novo membro' : modalMode === 'edit' ? 'Editar membro' : 'Detalhes do membro'}
        description={
          modalMode === 'create'
            ? 'Preencha as informações do membro.'
            : modalMode === 'edit'
              ? 'Atualize as informações do membro.'
              : 'Visualize as informações cadastradas do membro.'
        }
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitLabel={modalMode === 'create' ? 'Criar membro' : modalMode === 'edit' ? 'Salvar alterações' : 'Editar'}
        cancelLabel={modalMode === 'view' ? 'Fechar' : 'Cancelar'}
        isSubmitting={isSubmitting}
      >
        {submitError ? <ErrorAlert error={submitError} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="member-name" className="text-sm font-medium text-slate-700">Nome</label>
            <input
              id="member-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="member-phone" className="text-sm font-medium text-slate-700">Telefone</label>
            <input
              id="member-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="member-birth" className="text-sm font-medium text-slate-700">Data de nascimento</label>
            <input
              id="member-birth"
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
              required
              disabled={modalMode === 'view'}
            />
          </div>
        </div>
      </CreateUpdateModal>

      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        itemLabel="membro"
        itemName={memberToDelete?.name ?? ''}
        isSubmitting={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setMemberToDelete(null)
            setIsDeleteConfirmOpen(false)
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
