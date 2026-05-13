import { Avviso, AvvisoLettura } from '@/constants/types';

interface AvvisoDetailModalProps {
  isOpen: boolean;
  avviso: Avviso | null;
  onClose: () => void;
  formatDate: (dateIso?: string | null) => string;
  toOpenableUrl: (value: string) => string;
  getAttachmentLabel: (attachment: string, index: number) => string;
  letture: AvvisoLettura[];
  lettureLoading: boolean;
  lettureError: string | null;
  canManageAvvisi: boolean;
  isMarkingRead: boolean;
  onMarkLetto: (avvisoId: number) => void;
}

export function AvvisoDetailModal({
  isOpen,
  avviso,
  onClose,
  formatDate,
  toOpenableUrl,
  getAttachmentLabel,
  letture,
  lettureLoading,
  lettureError,
  canManageAvvisi,
  isMarkingRead,
  onMarkLetto
}: AvvisoDetailModalProps) {
  if (!isOpen || !avviso) {
    return null;
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-2xl p-5 w-full max-w-2xl border border-gray-100 dark:border-slate-800 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Dettaglio Avviso</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 text-2xl">
            ×
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{avviso.titolo}</h3>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200 px-2 py-1 rounded-full">{avviso.priorita}</span>
            <span className="text-xs bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200 px-2 py-1 rounded-full">{avviso.stato}</span>
            <span className="text-xs bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200 px-2 py-1 rounded-full">{avviso.categoria || 'Generale'}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                avviso.lettoDaUtente
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
              }`}
            >
              {avviso.lettoDaUtente ? 'Letto' : 'Da leggere'}
            </span>
          </div>

          {(avviso.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {avviso.tags.map((tag) => (
                <span key={`${avviso.id}-view-${tag}`} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 dark:border-slate-800">
            <p className="text-sm text-gray-700 dark:text-slate-200 whitespace-pre-wrap">{avviso.contenuto}</p>
          </div>

          {(avviso.allegati || []).length > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">Allegati e link</p>
              <ul className="space-y-1">
                {avviso.allegati.map((allegato, index) => (
                  <li key={`${avviso.id}-view-file-${allegato}`}>
                    <a
                      href={toOpenableUrl(allegato)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 underline break-all"
                    >
                      {getAttachmentLabel(allegato, index)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canManageAvvisi && (
            <div className="pt-2 border-t border-gray-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">Letture</p>
              {lettureLoading && <p className="text-xs text-gray-500 dark:text-slate-400">Caricamento letture...</p>}
              {lettureError && <p className="text-xs text-red-600 dark:text-red-300">{lettureError}</p>}
              {!lettureLoading && !lettureError && letture.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-slate-400">Nessuna lettura registrata.</p>
              )}
              {!lettureLoading && letture.length > 0 && (
                <ul className="space-y-1 text-xs text-gray-600 dark:text-slate-300">
                  {letture.map((lettura) => (
                    <li key={`lettura-${lettura.id}`} className="flex justify-between gap-4">
                      <span>
                        {lettura.nome} {lettura.cognome} • {lettura.email}
                      </span>
                      <span className="text-gray-400 dark:text-slate-500">{formatDate(lettura.lettoAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400 space-y-1">
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

        <div className="flex flex-wrap justify-end gap-3 mt-6">
          {!avviso.lettoDaUtente && (
            <button
              type="button"
              onClick={() => onMarkLetto(avviso.id)}
              disabled={isMarkingRead}
              className="px-4 py-2 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30 rounded-lg font-medium transition"
            >
              {isMarkingRead ? 'Segno letto...' : 'Segna come letto'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
