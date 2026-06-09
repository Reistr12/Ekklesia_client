import type { ReactNode } from 'react'

type Column<T> = {
  key: keyof T | string
  title: string
  render?: (row: T) => ReactNode
}

type TableProps<T> = {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
}

export function Table<T extends Record<string, unknown>>({ columns, data, onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.title} className="px-4 py-3 text-left font-medium text-slate-600">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => (
              <tr
                key={String(row.id ?? index)}
                className={`hover:bg-slate-50/70 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-3 text-slate-700">
                    {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
