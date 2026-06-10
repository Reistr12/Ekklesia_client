import { Plus } from 'lucide-react'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingCard } from '../../components/feedback/LoadingCard'
import { Table } from '../../components/tables/Table'
import { CreateUpdateModal } from '../../components/ui/CreateUpdateModal'
import { PageTitle } from '../../components/ui/PageTitle'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { StatCard } from '../../components/ui/StatCard'
import { useAnnouncementsPage } from './hook/useAnnouncementsPage.tsx'

export function AnnouncementsPage() {
  const {
    isModalOpen,
    setIsModalOpen,
    title,
    setTitle,
    channel,
    setChannel,
    status,
    setStatus,
    handleCreateAnnouncement,
    isSubmitting,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    safeCurrentPage,
    data,
    isLoading,
    canManage,
  } = useAnnouncementsPage()

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
    return <EmptyState title="Sem avisos" description="Quando houver avisos novos eles aparecerão aqui." />
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
          <PageTitle title="Comunicados" description="Avisos por canal e alcance" />
          {canManage ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Plus size={16} />
              Novo aviso
            </button>
          ) : null}
        </div>
        <Table
          data={data.announcements}
          columns={[
            { key: 'title', title: 'Título' },
            { key: 'channel', title: 'Canal' },
            { key: 'reach', title: 'Alcance' },
            { key: 'date', title: 'Data' },
            { key: 'status', title: 'Status' },
          ]}
        />

        <PaginationBar
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          currentItems={data.announcements.length}
          onPrev={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
          onNext={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
        />
      </section>

      <CreateUpdateModal
        isOpen={isModalOpen}
        title="Novo aviso"
        description="Crie um novo comunicado para os membros."
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAnnouncement}
        submitLabel="Criar aviso"
        isSubmitting={isSubmitting}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="announcement-title" className="text-sm font-medium text-slate-700">Título</label>
            <input id="announcement-title" value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600" required />
          </div>
          <div className="space-y-1">
            <label htmlFor="announcement-channel" className="text-sm font-medium text-slate-700">Canal</label>
            <input id="announcement-channel" value={channel} onChange={(event) => setChannel(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600" required />
          </div>
          <div className="space-y-1">
            <label htmlFor="announcement-status" className="text-sm font-medium text-slate-700">Status</label>
            <input id="announcement-status" value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600" required />
          </div>
        </div>
      </CreateUpdateModal>
    </div>
  )
}
