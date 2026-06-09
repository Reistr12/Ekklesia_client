import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingCard } from '../../components/feedback/LoadingCard'
import { Table } from '../../components/tables/Table'
import { CreateUpdateModal } from '../../components/ui/CreateUpdateModal'
import { PageTitle } from '../../components/ui/PageTitle'
import { StatCard } from '../../components/ui/StatCard'
import { getScheduleData } from '../../services/api/schedule'
import type { ScheduleData } from '../../services/api/schedule/types'
import { isChurchAdmin } from '../../utils/auth'

export function SchedulePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [ministry, setMinistry] = useState('')
  const [priority, setPriority] = useState('')

  const { data, isLoading } = useQuery<ScheduleData>({ queryKey: ['agenda'], queryFn: getScheduleData })
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
          <PageTitle title="Compromissos" description="Agenda estratégica por ministério" />
          {canManage ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Plus size={16} />
              Novo compromisso
            </button>
          ) : null}
        </div>
        <Table
          data={data.items}
          columns={[
            { key: 'title', title: 'Título' },
            { key: 'date', title: 'Data' },
            { key: 'time', title: 'Hora' },
            { key: 'ministry', title: 'Ministério' },
            { key: 'priority', title: 'Prioridade' },
          ]}
        />
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title="Novo compromisso"
        description="Preencha os dados do compromisso da agenda."
        onClose={() => setIsModalOpen(false)}
        onSubmit={async () => setIsModalOpen(false)}
        submitLabel="Criar compromisso"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="schedule-title" className="text-sm font-medium text-slate-700">Título</label>
            <input id="schedule-title" value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600" required />
          </div>
          <div className="space-y-1">
            <label htmlFor="schedule-date" className="text-sm font-medium text-slate-700">Data</label>
            <input id="schedule-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600" required />
          </div>
          <div className="space-y-1">
            <label htmlFor="schedule-time" className="text-sm font-medium text-slate-700">Hora</label>
            <input id="schedule-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600" required />
          </div>
          <div className="space-y-1">
            <label htmlFor="schedule-ministry" className="text-sm font-medium text-slate-700">Ministério</label>
            <input id="schedule-ministry" value={ministry} onChange={(event) => setMinistry(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600" required />
          </div>
          <div className="space-y-1">
            <label htmlFor="schedule-priority" className="text-sm font-medium text-slate-700">Prioridade</label>
            <input id="schedule-priority" value={priority} onChange={(event) => setPriority(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600" required />
          </div>
        </div>
      </CreateUpdateModal>
    </div>
  )
}
