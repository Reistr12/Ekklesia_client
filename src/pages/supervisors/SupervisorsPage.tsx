import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorAlert } from '../../components/feedback/ErrorAlert'
import { LoadingCard } from '../../components/feedback/LoadingCard'
import { Table } from '../../components/tables/Table'
import { CreateUpdateModal } from '../../components/ui/CreateUpdateModal'
import { SectionHeaderAction } from '../../components/ui/SectionHeaderAction'
import { StatCard } from '../../components/ui/StatCard'
import { createSupervisor, getSupervisorsData } from '../../services/api/supervisors'
import type { CreateSupervisorPayload, SupervisorsData } from '../../services/api/supervisors/types'
import { parseApiError, type ApiErrorDisplay } from '../../utils/apiError'
import { hasAnyRole } from '../../utils/auth'
import {
  type SupervisorValidationErrors,
  validateSupervisorForm,
} from './validations/validation'

const initialForm: CreateSupervisorPayload = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'SUPERVISOR',
}

export function SupervisorsPage() {
  const canCreateAdmin = false
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<CreateSupervisorPayload>(initialForm)
  const [submitError, setSubmitError] = useState<ApiErrorDisplay | null>(null)
  const [validationErrors, setValidationErrors] = useState<SupervisorValidationErrors>({})

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<SupervisorsData>({
    queryKey: ['supervisores'],
    queryFn: getSupervisorsData,
  })

  const canManage = hasAnyRole('ADMIN')

  const createMutation = useMutation({
    mutationFn: createSupervisor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['supervisores'] })
      setSubmitError(null)
      setForm(initialForm)
      setIsModalOpen(false)
    },
  })

  const isSubmitting = createMutation.isPending

  const supervisors = useMemo(() => data?.supervisors ?? [], [data])

  const handleSubmit = async () => {
    const formErrors = validateSupervisorForm(form)
    if (Object.keys(formErrors).length > 0) {
      setValidationErrors(formErrors)
      return
    }

    if (form.role === 'ADMIN' && !canCreateAdmin) {
      setSubmitError({
        message: 'No momento, o backend não permite criação de administrador por esta tela.',
        error: 'Use o fluxo de registro da igreja ou habilite endpoint específico para ADMIN.',
      })
      return
    }

    try {
      await createMutation.mutateAsync(form)
    } catch (error) {
      setSubmitError(parseApiError(error, 'Não foi possível cadastrar a pessoa. Tente novamente.'))
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

  if (!canManage) {
    return (
      <EmptyState
        title="Acesso restrito"
        description="Apenas administradores podem cadastrar supervisores."
      />
    )
  }

  if (!data) {
    return (
      <EmptyState
        title="Sem dados de supervisores"
        description="Não foi possível carregar os supervisores da igreja."
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
          title="Cadastro de pessoas"
          description="Cadastre e acompanhe administradores e supervisores"
          canManage={canManage}
          actionLabel="Nova pessoa"
          actionIcon={<Plus size={16} />}
          onAction={() => {
            setSubmitError(null)
            setValidationErrors({})
            setForm(initialForm)
            setIsModalOpen(true)
          }}
        />

        {supervisors.length === 0 ? (
          <EmptyState
            title="Nenhuma pessoa cadastrada"
            description="Cadastre a primeira pessoa para começar o gerenciamento."
          />
        ) : (
          <Table
            data={supervisors}
            columns={[
              { key: 'name', title: 'Nome' },
              { key: 'email', title: 'Email' },
              { key: 'phone', title: 'Telefone' },
              { key: 'role', title: 'Perfil' },
            ]}
          />
        )}
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title="Cadastrar pessoa"
        description="Preencha os dados para adicionar um administrador ou supervisor."
        onClose={() => {
          setSubmitError(null)
          setValidationErrors({})
          setForm(initialForm)
          setIsModalOpen(false)
        }}
        onSubmit={handleSubmit}
        submitLabel="Cadastrar pessoa"
        cancelLabel="Cancelar"
        isSubmitting={isSubmitting}
      >
        {submitError ? <ErrorAlert error={submitError} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="supervisor-name" className="text-sm font-medium text-slate-700">Nome</label>
            <input
              id="supervisor-name"
              value={form.name}
              onChange={(event) => {
                setForm((state) => ({ ...state, name: event.target.value }))
                setValidationErrors((current) => ({ ...current, name: undefined }))
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.name ? 'border-rose-400' : 'border-slate-200'}`}
              required
            />
            {validationErrors.name ? <p className="text-xs text-rose-600">{validationErrors.name}</p> : null}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="supervisor-email" className="text-sm font-medium text-slate-700">Email</label>
            <input
              id="supervisor-email"
              type="email"
              value={form.email}
              onChange={(event) => {
                setForm((state) => ({ ...state, email: event.target.value }))
                setValidationErrors((current) => ({ ...current, email: undefined }))
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.email ? 'border-rose-400' : 'border-slate-200'}`}
              required
            />
            {validationErrors.email ? <p className="text-xs text-rose-600">{validationErrors.email}</p> : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="supervisor-phone" className="text-sm font-medium text-slate-700">Telefone</label>
            <input
              id="supervisor-phone"
              value={form.phone}
              onChange={(event) => {
                setForm((state) => ({ ...state, phone: event.target.value }))
                setValidationErrors((current) => ({ ...current, phone: undefined }))
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.phone ? 'border-rose-400' : 'border-slate-200'}`}
              required
            />
            {validationErrors.phone ? <p className="text-xs text-rose-600">{validationErrors.phone}</p> : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="supervisor-password" className="text-sm font-medium text-slate-700">Senha</label>
            <input
              id="supervisor-password"
              type="password"
              value={form.password}
              onChange={(event) => {
                setForm((state) => ({ ...state, password: event.target.value }))
                setValidationErrors((current) => ({ ...current, password: undefined }))
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.password ? 'border-rose-400' : 'border-slate-200'}`}
              required
            />
            {validationErrors.password ? <p className="text-xs text-rose-600">{validationErrors.password}</p> : null}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="person-role" className="text-sm font-medium text-slate-700">Perfil</label>
            <select
              id="person-role"
              value={form.role}
              onChange={(event) =>
                {
                  setForm((state) => ({
                    ...state,
                    role: event.target.value as CreateSupervisorPayload['role'],
                  }))
                  setValidationErrors((current) => ({ ...current, role: undefined }))
                }
              }
              className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.role ? 'border-rose-400' : 'border-slate-200'}`}
            >
              <option value="SUPERVISOR">Supervisor</option>
              <option value="ADMIN" disabled={!canCreateAdmin}>Administrador (indisponível)</option>
            </select>
            {validationErrors.role ? <p className="text-xs text-rose-600">{validationErrors.role}</p> : null}
            <p className="text-xs text-slate-500">
              Observação: no backend atual, o endpoint de criação bloqueia perfil ADMIN por esta rota.
            </p>
          </div>
        </div>
      </CreateUpdateModal>
    </div>
  )
}
