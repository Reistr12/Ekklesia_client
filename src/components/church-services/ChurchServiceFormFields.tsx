import type { CreateChurchServicePayload } from '../../services/api/church-services/types'

type ChurchServiceFormFieldsProps = {
  title: string
  description: string
  day: CreateChurchServicePayload['day']
  streamUrl: string
  startsAt: string
  endsAt: string
  readOnly?: boolean
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onDayChange: (value: CreateChurchServicePayload['day']) => void
  onStreamUrlChange: (value: string) => void
  onStartsAtChange: (value: string) => void
  onEndsAtChange: (value: string) => void
}

export function ChurchServiceFormFields({
  title,
  description,
  day,
  streamUrl,
  startsAt,
  endsAt,
  readOnly = false,
  onTitleChange,
  onDescriptionChange,
  onDayChange,
  onStreamUrlChange,
  onStartsAtChange,
  onEndsAtChange,
}: ChurchServiceFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="church-service-title" className="text-sm font-medium text-slate-700">
          Título
        </label>
        <input
          id="church-service-title"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
          placeholder="Culto Domingo Manhã"
          required
          disabled={readOnly}
        />
      </div>

      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="church-service-description" className="text-sm font-medium text-slate-700">
          Descrição
        </label>
        <textarea
          id="church-service-description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
          placeholder="Descrição resumida do culto"
          required
          disabled={readOnly}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="church-service-day" className="text-sm font-medium text-slate-700">
          Dia
        </label>
        <select
          id="church-service-day"
          value={day}
          onChange={(event) => onDayChange(event.target.value as CreateChurchServicePayload['day'])}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
          disabled={readOnly}
        >
          <option value="SUNDAY">Domingo</option>
          <option value="MONDAY">Segunda</option>
          <option value="TUESDAY">Terça</option>
          <option value="WEDNESDAY">Quarta</option>
          <option value="THURSDAY">Quinta</option>
          <option value="FRIDAY">Sexta</option>
          <option value="SATURDAY">Sábado</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="church-service-stream-url" className="text-sm font-medium text-slate-700">
          Link da transmissão (opcional)
        </label>
        <input
          id="church-service-stream-url"
          type="url"
          value={streamUrl}
          onChange={(event) => onStreamUrlChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
          placeholder="https://youtube.com/..."
          disabled={readOnly}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="church-service-starts-at" className="text-sm font-medium text-slate-700">
          Início
        </label>
        <input
          id="church-service-starts-at"
          type="time"
          value={startsAt}
          onChange={(event) => onStartsAtChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
          required
          disabled={readOnly}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="church-service-ends-at" className="text-sm font-medium text-slate-700">
          Término
        </label>
        <input
          id="church-service-ends-at"
          type="time"
          value={endsAt}
          onChange={(event) => onEndsAtChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-600"
          required
          disabled={readOnly}
        />
      </div>
    </div>
  )
}
