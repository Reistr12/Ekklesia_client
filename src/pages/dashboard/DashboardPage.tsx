import { useQuery } from '@tanstack/react-query'
import { LoadingCard } from '../../components/feedback/LoadingCard'
import { BarMiniChart } from '../../components/charts/BarMiniChart'
import { EmptyState } from '../../components/feedback/EmptyState'
import { PageTitle } from '../../components/ui/PageTitle'
import { StatCard } from '../../components/ui/StatCard'
import { getDashboardData } from '../../services/api/dashboard'
import type { DashboardData } from '../../services/api/dashboard/types'
import { openGoogleCalendarDraft } from '../../utils/googleCalendar'

export function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardData,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <LoadingCard key={idx} />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <EmptyState
        title="Sem dados no dashboard"
        description="Nenhum indicador foi encontrado para exibição."
      />
    )
  }

  const handleGoogleCalendarLink = () => {
    const nextEvent = data.upcomingEvents[0]
    if (!nextEvent) {
      return
    }

    openGoogleCalendarDraft({
      title: nextEvent.title,
      description: nextEvent.description,
      startDate: nextEvent.isoDate,
      location: nextEvent.owner,
    })
  }

  return (
    <div className="space-y-6">
      {data.degraded ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Alguns blocos não puderam ser carregados no momento: {data.degradedSources.join(', ')}.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <BarMiniChart values={data.growth.map((point) => point.value)} labels={data.growth.map((point) => point.month)} />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Próximos eventos</h2>
              <p className="text-sm text-slate-500">Agenda imediata da igreja</p>
            </div>
            <button
              type="button"
              onClick={handleGoogleCalendarLink}
              disabled={data.upcomingEvents.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Vincular com Google Agenda
            </button>
          </div>
          <div className="space-y-3">
            {data.upcomingEvents.map((event) => (
              <div key={event.title} className="rounded-xl border border-slate-200 p-3">
                <p className="font-medium text-slate-800">{event.title}</p>
                <p className="text-sm text-slate-500">{event.date}</p>
                <p className="text-xs text-slate-400">{event.owner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <PageTitle title="Pedidos de oração" description="Demandas ativas de intercessão" />
            <div className="space-y-3">
              {data.prayerRequests.length === 0 ? (
                <EmptyState
                  title="Sem pedidos"
                  description="Os pedidos de oração aparecerão aqui quando forem registrados."
                />
              ) : (
                data.prayerRequests.map((request) => (
                  <div key={`${request.name}-${request.request}`} className="rounded-xl border border-slate-200 p-3">
                    <p className="font-medium text-slate-800">{request.name}</p>
                    <p className="text-sm text-slate-500">{request.request}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <PageTitle title="Atividades recentes" description="Eventos registrados no sistema" />
            <ul className="space-y-2">
              {data.activities.map((activity) => (
                <li
                  key={`${activity.description}-${activity.time}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{activity.description}</span>
                  <span className="text-xs text-slate-500">{activity.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
