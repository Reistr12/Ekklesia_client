import { useEffect, type FormEvent, type ReactNode } from 'react'

type CreateUpdateModalProps = {
  isOpen: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  onSubmit: () => void | Promise<void>
  submitLabel?: string
  cancelLabel?: string
  isSubmitting?: boolean
  widthClassName?: string
}

export function CreateUpdateModal({
  isOpen,
  title,
  description,
  children,
  onClose,
  onSubmit,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  widthClassName = 'max-w-2xl',
}: CreateUpdateModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-[2px]"
      onClick={() => {
        if (!isSubmitting) {
          onClose()
        }
      }}
      role="presentation"
    >
      <div
        className={`w-full ${widthClassName} rounded-2xl border border-slate-200 bg-white shadow-soft`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-update-modal-title"
      >
        <form onSubmit={handleSubmit}>
          <header className="border-b border-slate-200 px-6 py-5">
            <h2 id="create-update-modal-title" className="text-xl font-semibold text-slate-900">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </header>

          <section className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</section>

          <footer className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelLabel}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Salvando...' : submitLabel}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
