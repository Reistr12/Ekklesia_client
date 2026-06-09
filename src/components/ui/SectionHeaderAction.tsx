import type { ReactNode } from 'react'

type SectionHeaderActionProps = {
  title: string
  description: string
  canManage: boolean
  actionLabel: string
  actionIcon?: ReactNode
  onAction: () => void
  secondaryActionLabel?: string
  secondaryActionIcon?: ReactNode
  onSecondaryAction?: () => void
  secondaryActionDisabled?: boolean
}

export function SectionHeaderAction({
  title,
  description,
  canManage,
  actionLabel,
  actionIcon,
  onAction,
  secondaryActionLabel,
  secondaryActionIcon,
  onSecondaryAction,
  secondaryActionDisabled = false,
}: SectionHeaderActionProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onSecondaryAction && secondaryActionLabel ? (
          <button
            type="button"
            onClick={onSecondaryAction}
            disabled={secondaryActionDisabled}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {secondaryActionIcon}
            {secondaryActionLabel}
          </button>
        ) : null}

        {canManage ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            {actionIcon}
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
