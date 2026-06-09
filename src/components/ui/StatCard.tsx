type StatCardProps = {
  label: string
  value: string
  trend: string
}

export function StatCard({ label, value, trend }: StatCardProps) {
  const positive = !trend.startsWith('-')

  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className={`mt-1 text-sm ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{trend}</p>
    </article>
  )
}
