import { AvvisoFormData, PrioritaAvviso, StatoAvviso } from '@/constants/types';

interface AvvisoFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formData: AvvisoFormData;
  onFormDataChange: (next: AvvisoFormData) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isSubmitting: boolean;
  attachmentFiles: File[];
  onAttachmentFilesChange: (files: File[]) => void;
  existingEmbeddedAttachments?: string[];
  onRemoveExistingAttachment?: (index: number) => void;
  getAttachmentLabel?: (attachment: string, index: number) => string;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function AvvisoFormModal({
  isOpen,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  onClose,
  isSubmitting,
  attachmentFiles,
  onAttachmentFilesChange,
  existingEmbeddedAttachments = [],
  onRemoveExistingAttachment,
  getAttachmentLabel,
  onDelete,
  isDeleting = false
}: AvvisoFormModalProps) {
  if (!isOpen) {
    return null;
  }

  const isEditMode = mode === 'edit';

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-2xl border border-gray-100 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditMode ? 'Modifica Comunicazione' : 'Nuova Comunicazione'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo Comunicazione</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={isEditMode ? undefined : 'Es. 1368 - Avvisi per il giorno...'}
              value={formData.titolo}
              onChange={(event) => onFormDataChange({ ...formData, titolo: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorità</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.priorita}
                onChange={(event) =>
                  onFormDataChange({ ...formData, priorita: event.target.value as PrioritaAvviso })
                }
              >
                <option value="NORMALE">Normale</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.stato}
                onChange={(event) =>
                  onFormDataChange({ ...formData, stato: event.target.value as StatoAvviso })
                }
              >
                <option value="PUBBLICATO">Pubblicato</option>
                <option value="BOZZA">Bozza</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={isEditMode ? undefined : 'Es. Didattica'}
              value={formData.categoria}
              onChange={(event) => onFormDataChange({ ...formData, categoria: event.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag (separati da virgola)</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={isEditMode ? undefined : 'Es. consiglio-classe, urgente'}
              value={formData.tagsInput}
              onChange={(event) => onFormDataChange({ ...formData, tagsInput: event.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autore</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={isEditMode ? undefined : 'Es. La Direzione'}
              value={formData.autore}
              onChange={(event) => onFormDataChange({ ...formData, autore: event.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allegati (URL separati da virgola, facoltativo)</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://...pdf, https://...jpg"
              value={formData.allegatiInput}
              onChange={(event) => onFormDataChange({ ...formData, allegatiInput: event.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditMode ? 'Aggiungi nuovi file allegati' : 'Carica file allegati (PDF, immagini, documenti)'}
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(event) => onAttachmentFilesChange(Array.from(event.target.files || []))}
            />

            {isEditMode && existingEmbeddedAttachments.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">File già allegati ({existingEmbeddedAttachments.length})</p>
                <ul className="space-y-1">
                  {existingEmbeddedAttachments.map((attachment, index) => (
                    <li
                      key={`existing-file-${index}`}
                      className="flex items-center justify-between gap-2 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1"
                    >
                      <span className="text-gray-700 truncate">
                        {getAttachmentLabel ? getAttachmentLabel(attachment, index) : `Allegato ${index + 1}`}
                      </span>
                      {onRemoveExistingAttachment && (
                        <button
                          type="button"
                          onClick={() => onRemoveExistingAttachment(index)}
                          className="text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
                        >
                          Rimuovi
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {attachmentFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {isEditMode ? `Nuovi file selezionati: ${attachmentFiles.length}` : `${attachmentFiles.length} file selezionati`}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditMode ? 'Contenuto' : 'Testo Avviso'}
            </label>
            <textarea
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder={isEditMode ? undefined : "Scrivi il contenuto dell'avviso..."}
              value={formData.contenuto}
              onChange={(event) => onFormDataChange({ ...formData, contenuto: event.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition shadow"
            >
              {isSubmitting ? (isEditMode ? 'Salvataggio...' : 'Pubblicazione...') : isEditMode ? 'Salva modifiche' : 'Pubblica'}
            </button>
            {isEditMode && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
              >
                {isDeleting ? 'Eliminazione...' : 'Elimina'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
