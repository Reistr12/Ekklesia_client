type BarMiniChartProps = {
  values: number[]
  labels: string[]
}

export function BarMiniChart({ values, labels }: BarMiniChartProps) {
  const max = Math.max(...values, 1)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Crescimento de membros</h3>
        <span className="text-xs text-slate-500">Últimos 6 meses</span>
      </div>
      <div className="flex h-44 items-end gap-3">
        {values.map((value, idx) => (
          <div key={`${labels[idx]}-${value}`} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">{value}</span>
            <div className="w-full rounded-t-md bg-brand-600/85" style={{ height: `${(value / max) * 100}%` }} />
            <span className="text-xs text-slate-500">{labels[idx]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
