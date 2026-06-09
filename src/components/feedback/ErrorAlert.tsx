import type { ApiErrorDisplay } from '../../utils/apiError'

type ErrorAlertProps = {
  error: ApiErrorDisplay
  className?: string
}

export function ErrorAlert({ error, className }: ErrorAlertProps) {
  const wrapperClassName = className ?? 'mb-4'

  return (
    <div className={`${wrapperClassName} rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700`}>
      <p className="text-sm font-medium">{error.message}</p>
      {error.error ? <p className="mt-1 text-xs text-rose-600">{error.error}</p> : null}
    </div>
  )
}
