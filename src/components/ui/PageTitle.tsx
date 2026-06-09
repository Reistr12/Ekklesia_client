type PageTitleProps = {
  title: string
  description: string
}

export function PageTitle({ title, description }: PageTitleProps) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  )
}
