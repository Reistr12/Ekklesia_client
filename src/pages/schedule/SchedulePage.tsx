import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingCard } from '../../components/feedback/LoadingCard'
import { Table } from '../../components/tables/Table'
import { CreateUpdateModal } from '../../components/ui/CreateUpdateModal'
import { PageTitle } from '../../components/ui/PageTitle'
import { StatCard } from '../../components/ui/StatCard'
import { getScheduleData } from '../../services/api/schedule'
import type { ScheduleData } from '../../services/api/schedule/types'
import { isChurchAdmin } from '../../utils/auth'
import { type ScheduleValidationErrors, validateScheduleForm } from './validations/validation'

export function SchedulePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [ministry, setMinistry] = useState('')
  const [validationErrors, setValidationErrors] = useState<ScheduleValidationErrors>({})
  const location = useLocation()
  const isPastorAgenda = location.pathname === '/agenda/pastor'

  const { data, isLoading } = useQuery<ScheduleData>({ queryKey: ['agenda'], queryFn: getScheduleData })
  const canManage = isChurchAdmin()

  const filteredItems = (data?.items ?? []).filter((item) =>
    isPastorAgenda ? item.agendaType === 'PASTOR' : item.agendaType === 'MINISTERIAL',
  )

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
    return <EmptyState title="Agenda vazia" description="Nenhum item de agenda foi encontrado." />
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} />
        ))}
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <PageTitle
              title={isPastorAgenda ? 'Agenda do pastor' : 'Agenda ministerial'}
              description={
                isPastorAgenda
                  ? 'Compromissos individuais do pastor.'
                  : 'Eventos e compromissos da igreja.'
              }
            />
          </div>
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
              Novo compromisso
            </button>
          ) : null}
        </div>

        <Table
          data={filteredItems}
          columns={[
            { key: 'title', title: 'Título' },
            { key: 'date', title: 'Data' },
            { key: 'time', title: 'Hora' },
          ]}
        />
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title="Novo compromisso"
        description="Preencha os dados do compromisso da agenda."
        onClose={() => {
          setValidationErrors({})
          setIsModalOpen(false)
        }}
        onSubmit={async () => {
          const formErrors = validateScheduleForm({ title, date, time, ministry })
          if (Object.keys(formErrors).length > 0) {
            setValidationErrors(formErrors)
            return
          }

          setValidationErrors({})
          setIsModalOpen(false)
        }}
        submitLabel="Criar compromisso"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="schedule-title" className="text-sm font-medium text-slate-700">Título</label>
            <input id="schedule-title" value={title} onChange={(event) => { setTitle(event.target.value); setValidationErrors((current) => ({ ...current, title: undefined })) }} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.title ? 'border-rose-400' : 'border-slate-200'}`} required />
            {validationErrors.title ? <p className="text-xs text-rose-600">{validationErrors.title}</p> : null}
          </div>
          <div className="space-y-1">
            <label htmlFor="schedule-date" className="text-sm font-medium text-slate-700">Data</label>
            <input id="schedule-date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setValidationErrors((current) => ({ ...current, date: undefined })) }} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.date ? 'border-rose-400' : 'border-slate-200'}`} required />
            {validationErrors.date ? <p className="text-xs text-rose-600">{validationErrors.date}</p> : null}
          </div>
          <div className="space-y-1">
            <label htmlFor="schedule-time" className="text-sm font-medium text-slate-700">Hora</label>
            <input id="schedule-time" type="time" value={time} onChange={(event) => { setTime(event.target.value); setValidationErrors((current) => ({ ...current, time: undefined })) }} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 ${validationErrors.time ? 'border-rose-400' : 'border-slate-200'}`} required />
            {validationErrors.time ? <p className="text-xs text-rose-600">{validationErrors.time}</p> : null}
          </div>
        </div>
      </CreateUpdateModal>
    </div>
  )
}
