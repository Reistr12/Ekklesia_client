import { CreateUpdateModal } from './CreateUpdateModal'

type ConfirmDeleteModalProps = {
  isOpen: boolean
  itemLabel: string
  itemName: string
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

export function ConfirmDeleteModal({
  isOpen,
  itemLabel,
  itemName,
  isSubmitting,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <CreateUpdateModal
      isOpen={isOpen}
      title="Confirmar exclusão"
      description="Essa ação não pode ser desfeita."
      onClose={onClose}
      onSubmit={onConfirm}
      submitLabel={`Excluir ${itemLabel}`}
      cancelLabel="Cancelar"
      isSubmitting={isSubmitting}
      widthClassName="max-w-md"
    >
      <div className="space-y-2">
        <p className="text-sm text-slate-700">
          Tem certeza que deseja excluir {itemLabel}{' '}
          <span className="font-semibold text-slate-900">{itemName || '-'}</span>?
        </p>
        <p className="text-sm text-rose-700">Ao confirmar, o registro será removido permanentemente.</p>
      </div>
    </CreateUpdateModal>
  )
}
