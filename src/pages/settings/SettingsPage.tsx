import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingCard } from '../../components/feedback/LoadingCard'
import { Table } from '../../components/tables/Table'
import { CreateUpdateModal } from '../../components/ui/CreateUpdateModal'
import { PageTitle } from '../../components/ui/PageTitle'
import { StatCard } from '../../components/ui/StatCard'
import { getSettingsData } from '../../services/api/settings'
import type { SettingsData } from '../../services/api/settings/types'
import { isChurchAdmin } from '../../utils/auth'
import { type SettingsValidationErrors, validateSettingsForm } from './validations/validation'

export function SettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [moduleName, setModuleName] = useState('')
  const [status, setStatus] = useState('')
  const [validationErrors, setValidationErrors] = useState<SettingsValidationErrors>({})

  const { data, isLoading } = useQuery<SettingsData>({
    queryKey: ['configuracoes'],
    queryFn: getSettingsData,
  })
  const canManage = isChurchAdmin()

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
    return <EmptyState title="Sem configurações" description="Nenhuma configuração disponível." />
  }

  return (
    <div className="space-y-6">
      {data.degraded ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Alguns dados de configuração não puderam ser carregados: {data.degradedSources.join(', ')}.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} />
        ))}
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <PageTitle title="Módulos e preferências" description="Status dos recursos habilitados" />
          {canManage ? (
            <button
              type="button"
              onClick={() => {
                setValidationErrors({})
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Plus size={16} />
              Nova configuração
            </button>
          ) : null}
        </div>
        <Table
          data={data.settings}
          columns={[
            { key: 'module', title: 'Módulo' },
            { key: 'status', title: 'Status' },
            { key: 'updatedAt', title: 'Atualizado em' },
          ]}
        />
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title="Nova configuração"
        description="Defina um novo módulo ou ajuste de configuração."
        onClose={() => {
          setValidationErrors({})
          setIsModalOpen(false)
        }}
        onSubmit={async () => {
          const formErrors = validateSettingsForm({ moduleName, status })
          if (Object.keys(formErrors).length > 0) {
            setValidationErrors(formErrors)
            return
          }

          setValidationErrors({})
          setIsModalOpen(false)
        }}
        submitLabel="Criar configuração"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="settings-module" className="text-sm font-medium text-slate-700">Módulo</label>
            <input id="settings-module" value={moduleName} onChange={(event) => { setModuleName(event.target.value); setValidationErrors((current) => ({ ...current, moduleName: undefined })) }} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.moduleName ? 'border-rose-400' : 'border-slate-200'}`} required />
            {validationErrors.moduleName ? <p className="text-xs text-rose-600">{validationErrors.moduleName}</p> : null}
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="settings-status" className="text-sm font-medium text-slate-700">Status</label>
            <input id="settings-status" value={status} onChange={(event) => { setStatus(event.target.value); setValidationErrors((current) => ({ ...current, status: undefined })) }} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.status ? 'border-rose-400' : 'border-slate-200'}`} required />
            {validationErrors.status ? <p className="text-xs text-rose-600">{validationErrors.status}</p> : null}
          </div>
        </div>
      </CreateUpdateModal>
    </div>
  )
}
