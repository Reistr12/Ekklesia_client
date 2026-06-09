import { Plus } from 'lucide-react'
import { PageTitle } from '../ui/PageTitle'

type ChurchServicesSectionHeaderProps = {
  canManage: boolean
  onCreate: () => void
}

export function ChurchServicesSectionHeader({ canManage, onCreate }: ChurchServicesSectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <PageTitle title="Próximos cultos" description="Escala e organização semanal" />
      {canManage ? (
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus size={16} />
          Novo culto
        </button>
      ) : null}
    </div>
  )
}
