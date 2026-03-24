import { Avviso } from '@/constants/types';

interface AvvisoDetailModalProps {
  isOpen: boolean;
  avviso: Avviso | null;
  onClose: () => void;
  formatDate: (dateIso?: string | null) => string;
  toOpenableUrl: (value: string) => string;
  getAttachmentLabel: (attachment: string, index: number) => string;
}

export function AvvisoDetailModal({
  isOpen,
  avviso,
  onClose,
  formatDate,
  toOpenableUrl,
  getAttachmentLabel
}: AvvisoDetailModalProps) {
  if (!isOpen || !avviso) {
    return null;
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-2xl border border-gray-100 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Dettaglio Avviso</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{avviso.titolo}</h3>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{avviso.priorita}</span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{avviso.stato}</span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{avviso.categoria || 'Generale'}</span>
          </div>

          {(avviso.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {avviso.tags.map((tag) => (
                <span key={`${avviso.id}-view-${tag}`} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{avviso.contenuto}</p>
          </div>

          {(avviso.allegati || []).length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm font-semibold text-gray-700 mb-2">Allegati e link</p>
              <ul className="space-y-1">
                {avviso.allegati.map((allegato, index) => (
                  <li key={`${avviso.id}-view-file-${allegato}`}>
                    <a
                      href={toOpenableUrl(allegato)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 underline break-all"
                    >
                      {getAttachmentLabel(allegato, index)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t text-xs text-gray-500 space-y-1">
            <p>Autore: {avviso.autore}</p>
            <p>
              Creato: {formatDate(avviso.dataCreazione)} {avviso.creatoDa ? `• da ${avviso.creatoDa}` : ''}
            </p>
            <p>
              Aggiornato: {formatDate(avviso.dataAggiornamento || avviso.dataCreazione)}
              {avviso.aggiornatoDa ? ` • da ${avviso.aggiornatoDa}` : ''}
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
