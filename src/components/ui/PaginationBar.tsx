type PaginationBarProps = {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  currentItems: number
  onPrev: () => void
  onNext: () => void
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  currentItems,
  onPrev,
  onNext,
}: PaginationBarProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-sm text-slate-600">
        Exibindo <span className="font-medium text-slate-800">{currentItems}</span> de{' '}
        <span className="font-medium text-slate-800">{totalItems}</span> itens
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-sm text-slate-600">
          Página <span className="font-medium text-slate-800">{currentPage}</span> de{' '}
          <span className="font-medium text-slate-800">{totalPages}</span>
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  )
}
