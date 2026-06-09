import { MoreHorizontal } from 'lucide-react'
import { Table } from '../tables/Table'
import type { ChurchService } from '../../services/api/church-services/types'

type ChurchServicesTableProps = {
  data: ChurchService[]
  canManage: boolean
  onRowClick: (service: ChurchService) => void
  onToggleOptions: (serviceId: string, target: HTMLButtonElement) => void
}

export function ChurchServicesTable({
  data,
  canManage,
  onRowClick,
  onToggleOptions,
}: ChurchServicesTableProps) {
  return (
    <Table
      data={data}
      onRowClick={onRowClick}
      columns={[
        { key: 'name', title: 'Culto' },
        { key: 'date', title: 'Data' },
        { key: 'time', title: 'Horário' },
        { key: 'day', title: 'Dia' },
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
                    onToggleOptions(row.id, event.currentTarget)
                  }}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            ) : (
              <span className="text-slate-400">-</span>
            ),
        },
      ]}
    />
  )
}
