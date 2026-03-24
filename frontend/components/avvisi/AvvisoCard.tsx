import { Avviso } from '@/constants/types';

interface AvvisoCardProps {
  avviso: Avviso;
  canManageAvvisi: boolean;
  onOpen: (avviso: Avviso) => void;
  onEdit: (avviso: Avviso) => void;
  formatDate: (dateIso?: string | null) => string;
  toOpenableUrl: (value: string) => string;
  getAttachmentLabel: (attachment: string, index: number) => string;
}

export function AvvisoCard({
  avviso,
  canManageAvvisi,
  onOpen,
  onEdit,
  formatDate,
  toOpenableUrl,
  getAttachmentLabel
}: AvvisoCardProps) {
  return (
    <article
      className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md bg-white ${
        avviso.priorita === 'ALTA' ? 'border-red-300 bg-red-50/40' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-800 leading-tight">{avviso.titolo}</h3>
        <div className="flex gap-1">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              avviso.priorita === 'ALTA' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {avviso.priorita}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              avviso.stato === 'BOZZA' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {avviso.stato}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">Categoria: {avviso.categoria || 'Generale'}</p>
      {(avviso.tags || []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {avviso.tags.map((tag) => (
            <span key={`${avviso.id}-${tag}`} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{avviso.contenuto}</p>

      {(avviso.allegati || []).length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-600 mb-1">Allegati</p>
          <ul className="space-y-1">
            {avviso.allegati.map((allegato, index) => (
              <li key={`${avviso.id}-${allegato}`}>
                <a
                  href={toOpenableUrl(allegato)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 underline break-all"
                >
                  {getAttachmentLabel(allegato, index)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>Autore: {avviso.autore}</p>
        <p>
          Creato: {formatDate(avviso.dataCreazione)} {avviso.creatoDa ? `• da ${avviso.creatoDa}` : ''}
        </p>
        <p>
          Aggiornato: {formatDate(avviso.dataAggiornamento || avviso.dataCreazione)}
          {avviso.aggiornatoDa ? ` • da ${avviso.aggiornatoDa}` : ''}
        </p>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => onOpen(avviso)}
          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
        >
          Apri
        </button>
        {canManageAvvisi && (
          <button
            onClick={() => onEdit(avviso)}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium"
          >
            Modifica
          </button>
        )}
      </div>
    </article>
  );
}
