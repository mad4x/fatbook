'use client';

import { useEffect, useState } from 'react';
import { getBaseUrl } from '@/lib/api-url';
import { fetchWithAuth, getRolesFromToken, hasVicepresidenzaRole } from '@/lib/jwt';

type PrioritaAvviso = 'NORMALE' | 'ALTA';
type StatoAvviso = 'BOZZA' | 'PUBBLICATO';

interface Avviso {
  id: number;
  titolo: string;
  contenuto: string;
  dataCreazione: string;
  dataAggiornamento?: string | null;
  autore: string;
  priorita: PrioritaAvviso;
  stato: StatoAvviso;
  categoria: string;
  tags: string[];
  allegati: string[];
  creatoDa?: string | null;
  aggiornatoDa?: string | null;
}

interface FormData {
  titolo: string;
  contenuto: string;
  autore: string;
  categoria: string;
  priorita: PrioritaAvviso;
  stato: StatoAvviso;
  tagsInput: string;
  allegatiInput: string;
}

interface AvvisoWritePayload {
  titolo: string;
  contenuto: string;
  autore: string;
  categoria: string;
  priorita: PrioritaAvviso;
  stato: StatoAvviso;
  tags: string[];
  allegati: string[];
}

const initialFormData: FormData = {
  titolo: '',
  contenuto: '',
  autore: '',
  categoria: 'Generale',
  priorita: 'NORMALE',
  stato: 'PUBBLICATO',
  tagsInput: '',
  allegatiInput: ''
};

export default function AvvisiPage() {
  const [avvisi, setAvvisi] = useState<Avviso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroPriorita, setFiltroPriorita] = useState<'TUTTE' | PrioritaAvviso>('TUTTE');
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedAvviso, setSelectedAvviso] = useState<Avviso | null>(null);
  const [selectedViewAvviso, setSelectedViewAvviso] = useState<Avviso | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editFormData, setEditFormData] = useState<FormData>(initialFormData);
  const [newAttachmentFiles, setNewAttachmentFiles] = useState<File[]>([]);
  const [editAttachmentFiles, setEditAttachmentFiles] = useState<File[]>([]);
  const [editEmbeddedAttachments, setEditEmbeddedAttachments] = useState<string[]>([]);

  const canManageAvvisi = hasVicepresidenzaRole(userRoles);

  const parseMultiValue = (input: string): string[] => {
    return input
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const normalizeList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item.length > 0);
    }

    if (typeof value === 'string') {
      return parseMultiValue(value);
    }

    return [];
  };

  const isDataAttachment = (value: string) => value.trim().toLowerCase().startsWith('data:');

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Impossibile leggere il file selezionato'));
      };
      reader.onerror = () => reject(new Error('Errore durante la lettura del file'));
      reader.readAsDataURL(file);
    });

  const toDataUrlList = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) {
      return [];
    }

    return Promise.all(files.map((file) => fileToDataUrl(file)));
  };

  const getAttachmentLabel = (allegato: string, index: number) => {
    if (isDataAttachment(allegato)) {
      const mimeMatch = allegato.match(/^data:([^;]+);/i);
      const mime = mimeMatch?.[1] ?? 'file';
      return `Allegato file ${index + 1} (${mime})`;
    }

    return allegato;
  };

  const normalizeAvviso = (raw: any): Avviso => {
    const priorita: PrioritaAvviso = raw?.priorita === 'ALTA' ? 'ALTA' : 'NORMALE';
    const stato: StatoAvviso = raw?.stato === 'BOZZA' ? 'BOZZA' : 'PUBBLICATO';

    return {
      id: Number(raw?.id ?? Date.now()),
      titolo: typeof raw?.titolo === 'string' ? raw.titolo : '',
      contenuto: typeof raw?.contenuto === 'string' ? raw.contenuto : '',
      dataCreazione: typeof raw?.dataCreazione === 'string' ? raw.dataCreazione : '',
      dataAggiornamento: typeof raw?.dataAggiornamento === 'string' ? raw.dataAggiornamento : null,
      autore: typeof raw?.autore === 'string' ? raw.autore : '',
      priorita,
      stato,
      categoria: typeof raw?.categoria === 'string' && raw.categoria.trim() ? raw.categoria : 'Generale',
      tags: normalizeList(raw?.tags),
      allegati: normalizeList(raw?.allegati),
      creatoDa: typeof raw?.creatoDa === 'string' ? raw.creatoDa : null,
      aggiornatoDa: typeof raw?.aggiornatoDa === 'string' ? raw.aggiornatoDa : null
    };
  };

  const toOpenableUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    if (/^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) {
      return trimmed;
    }
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (/^www\./i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return `https://${trimmed}`;
  };

  const buildPayload = async (
    data: FormData,
    selectedFiles: File[],
    preservedAttachments: string[] = []
  ): Promise<AvvisoWritePayload> => {
    const links = parseMultiValue(data.allegatiInput);
    const uploadedFiles = await toDataUrlList(selectedFiles);

    return {
      titolo: data.titolo.trim(),
      contenuto: data.contenuto.trim(),
      autore: data.autore.trim(),
      categoria: data.categoria.trim() || 'Generale',
      priorita: data.priorita,
      stato: data.stato,
      tags: parseMultiValue(data.tagsInput),
      allegati: [...preservedAttachments, ...links, ...uploadedFiles]
    };
  };

  const getFriendlyError = (err: unknown) => {
    if (err instanceof TypeError) {
      return 'NetworkError: impossibile contattare il server. Verifica connessione e backend attivo.';
    }
    return 'Si è verificato un errore inatteso. Riprova tra qualche secondo.';
  };

  const formatDate = (dateIso?: string | null) => {
    if (!dateIso) {
      return '-';
    }
    const date = new Date(dateIso);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString('it-IT');
  };

  useEffect(() => {
    setUserRoles(getRolesFromToken());

    const fetchAvvisi = async () => {
      try {
        setLoading(true);
        setError(null);
        setNetworkError(null);

        const response = await fetchWithAuth(`${getBaseUrl()}/avvisi`, {
          method: 'GET',
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Errore del server: ${response.status}`);
        }

        const data = await response.json();
        const normalized = Array.isArray(data) ? data.map(normalizeAvviso) : [];
        setAvvisi(normalized);
      } catch (err) {
        console.error('Errore di connessione:', err);
        setNetworkError(getFriendlyError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAvvisi();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError(null);
      setNetworkError(null);

      const payload = await buildPayload(formData, newAttachmentFiles);
      const response = await fetchWithAuth(`${getBaseUrl()}/avvisi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('FORBIDDEN_CREATE_AVVISO');
        }
        throw new Error(`Errore del server: ${response.status}`);
      }

      const nuovoAvviso: Avviso = normalizeAvviso(await response.json());
      setAvvisi((prev) => [nuovoAvviso, ...prev]);
      chiudiCreazioneAvviso();
    } catch (err) {
      console.error('Errore creazione avviso:', err);
      if (err instanceof Error && err.message === 'FORBIDDEN_CREATE_AVVISO') {
        setError('Permesso negato (403): accedi con un utente VICEPRESIDENZA per creare avvisi.');
        return;
      }
      setNetworkError(getFriendlyError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const apriModificaAvviso = (avviso: Avviso) => {
    const embeddedAttachments = (avviso.allegati || []).filter((item) => isDataAttachment(item));
    const linkAttachments = (avviso.allegati || []).filter((item) => !isDataAttachment(item));

    setSelectedAvviso(avviso);
    setEditFormData({
      titolo: avviso.titolo,
      contenuto: avviso.contenuto,
      autore: avviso.autore,
      categoria: avviso.categoria || 'Generale',
      priorita: avviso.priorita,
      stato: avviso.stato,
      tagsInput: (avviso.tags || []).join(', '),
      allegatiInput: linkAttachments.join(', ')
    });
    setEditEmbeddedAttachments(embeddedAttachments);
    setEditAttachmentFiles([]);
    setIsEditModalOpen(true);
  };

  const chiudiModificaAvviso = () => {
    setIsEditModalOpen(false);
    setSelectedAvviso(null);
    setEditAttachmentFiles([]);
    setEditEmbeddedAttachments([]);
  };

  const rimuoviFileAllegatoEsistente = (indexToRemove: number) => {
    setEditEmbeddedAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const apriDettaglioAvviso = (avviso: Avviso) => {
    setSelectedViewAvviso(avviso);
    setIsViewModalOpen(true);
  };

  const chiudiDettaglioAvviso = () => {
    setIsViewModalOpen(false);
    setSelectedViewAvviso(null);
  };

  const chiudiCreazioneAvviso = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setNewAttachmentFiles([]);
  };

  const salvaModificaAvviso = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedAvviso) {
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      setNetworkError(null);

      const payload = await buildPayload(editFormData, editAttachmentFiles, editEmbeddedAttachments);
      const response = await fetchWithAuth(`${getBaseUrl()}/avvisi/${selectedAvviso.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Errore del server: ${response.status}`);
      }

      const aggiornato: Avviso = normalizeAvviso(await response.json());
      setAvvisi((prev) => prev.map((item) => (item.id === aggiornato.id ? aggiornato : item)));
      chiudiModificaAvviso();
    } catch (err) {
      console.error('Errore modifica avviso:', err);
      setNetworkError(getFriendlyError(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const eliminaAvvisoSelezionato = async () => {
    if (!selectedAvviso) {
      return;
    }

    const confermato = window.confirm('Confermi l\'eliminazione dell\'avviso selezionato?');
    if (!confermato) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      setNetworkError(null);

      const response = await fetchWithAuth(`${getBaseUrl()}/avvisi/${selectedAvviso.id}`, {
        method: 'DELETE'
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Errore del server: ${response.status}`);
      }

      setAvvisi((prev) => prev.filter((item) => item.id !== selectedAvviso.id));
      chiudiModificaAvviso();
    } catch (err) {
      console.error('Errore eliminazione avviso:', err);
      setNetworkError(getFriendlyError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const avvisiFiltrati = avvisi.filter((avviso) => {
    const ricerca = searchTerm.trim().toLowerCase();
    const matchRicerca =
      avviso.titolo.toLowerCase().includes(ricerca) ||
      avviso.contenuto.toLowerCase().includes(ricerca) ||
      avviso.autore.toLowerCase().includes(ricerca) ||
      (avviso.categoria || '').toLowerCase().includes(ricerca) ||
      (avviso.tags || []).some((tag) => tag.toLowerCase().includes(ricerca));
    const matchPriorita = filtroPriorita === 'TUTTE' || avviso.priorita === filtroPriorita;
    return matchRicerca && matchPriorita;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Avvisi</h1>
          <p className="text-gray-500 mt-1">Istituto C. GRASSI - A.S. 2025/2026</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
          <p className="font-bold flex items-center gap-2">⚠️ Attenzione</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {networkError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
          <p className="font-bold flex items-center gap-2">⚠️ NetworkError</p>
          <p className="text-sm mt-1">{networkError}</p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-xl mb-8 flex flex-wrap gap-4 items-center border border-gray-100 shadow-sm">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Cerca titolo, contenuto, autore, categoria o tag..."
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-64">
          <select
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            value={filtroPriorita}
            onChange={(e) => setFiltroPriorita(e.target.value as 'TUTTE' | PrioritaAvviso)}
          >
            <option value="TUTTE">Tutte le priorità</option>
            <option value="NORMALE">Normale</option>
            <option value="ALTA">Alta</option>
          </select>
        </div>

        {canManageAvvisi && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow transition"
          >
            + Nuovo Avviso
          </button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-gray-100 rounded-lg w-full"></div>
          ))}
        </div>
      ) : (
        !error && (
          <div className="space-y-8">
            {avvisiFiltrati.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-500 text-lg">Nessun avviso presente nel database.</p>
                <p className="text-gray-400 text-sm mt-2">Usa il tasto &quot;+ Nuovo Avviso&quot; per crearne uno.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avvisiFiltrati.map((avviso) => (
                <article
                  key={avviso.id}
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
                    <p>Creato: {formatDate(avviso.dataCreazione)} {avviso.creatoDa ? `• da ${avviso.creatoDa}` : ''}</p>
                    <p>
                      Aggiornato: {formatDate(avviso.dataAggiornamento || avviso.dataCreazione)}
                      {avviso.aggiornatoDa ? ` • da ${avviso.aggiornatoDa}` : ''}
                    </p>
                  </div>

                  {canManageAvvisi && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => apriDettaglioAvviso(avviso)}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                      >
                        Apri
                      </button>
                      <button
                        onClick={() => apriModificaAvviso(avviso)}
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium"
                      >
                        Modifica
                      </button>
                    </div>
                  )}

                  {!canManageAvvisi && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => apriDettaglioAvviso(avviso)}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                      >
                        Apri
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )
      )}

      {isViewModalOpen && selectedViewAvviso && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-2xl border border-gray-100 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Dettaglio Avviso</h2>
              <button onClick={chiudiDettaglioAvviso} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">{selectedViewAvviso.titolo}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{selectedViewAvviso.priorita}</span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{selectedViewAvviso.stato}</span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{selectedViewAvviso.categoria || 'Generale'}</span>
              </div>

              {(selectedViewAvviso.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedViewAvviso.tags.map((tag) => (
                    <span key={`${selectedViewAvviso.id}-view-${tag}`} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedViewAvviso.contenuto}</p>
              </div>

              {(selectedViewAvviso.allegati || []).length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Allegati e link</p>
                  <ul className="space-y-1">
                    {selectedViewAvviso.allegati.map((allegato, index) => (
                      <li key={`${selectedViewAvviso.id}-view-file-${allegato}`}>
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
                <p>Autore: {selectedViewAvviso.autore}</p>
                <p>Creato: {formatDate(selectedViewAvviso.dataCreazione)} {selectedViewAvviso.creatoDa ? `• da ${selectedViewAvviso.creatoDa}` : ''}</p>
                <p>
                  Aggiornato: {formatDate(selectedViewAvviso.dataAggiornamento || selectedViewAvviso.dataCreazione)}
                  {selectedViewAvviso.aggiornatoDa ? ` • da ${selectedViewAvviso.aggiornatoDa}` : ''}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={chiudiDettaglioAvviso}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-2xl border border-gray-100 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Nuova Comunicazione</h2>
              <button onClick={chiudiCreazioneAvviso} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titolo Comunicazione</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Es. 1368 - Avvisi per il giorno..."
                  value={formData.titolo}
                  onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorità</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.priorita}
                    onChange={(e) => setFormData({ ...formData, priorita: e.target.value as PrioritaAvviso })}
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
                    onChange={(e) => setFormData({ ...formData, stato: e.target.value as StatoAvviso })}
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
                  placeholder="Es. Didattica"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag (separati da virgola)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Es. consiglio-classe, urgente"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autore</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Es. La Direzione"
                  value={formData.autore}
                  onChange={(e) => setFormData({ ...formData, autore: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allegati (URL separati da virgola, facoltativo)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://...pdf, https://...jpg"
                  value={formData.allegatiInput}
                  onChange={(e) => setFormData({ ...formData, allegatiInput: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carica file allegati (PDF, immagini, documenti)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setNewAttachmentFiles(Array.from(e.target.files || []))}
                />
                {newAttachmentFiles.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{newAttachmentFiles.length} file selezionati</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Testo Avviso</label>
                <textarea
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={4}
                  placeholder="Scrivi il contenuto dell'avviso..."
                  value={formData.contenuto}
                  onChange={(e) => setFormData({ ...formData, contenuto: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={chiudiCreazioneAvviso}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition shadow"
                >
                  {isSaving ? 'Pubblicazione...' : 'Pubblica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedAvviso && canManageAvvisi && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-2xl border border-gray-100 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Modifica Comunicazione</h2>
              <button onClick={chiudiModificaAvviso} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <form onSubmit={salvaModificaAvviso} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titolo Comunicazione</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editFormData.titolo}
                  onChange={(e) => setEditFormData({ ...editFormData, titolo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorità</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={editFormData.priorita}
                    onChange={(e) => setEditFormData({ ...editFormData, priorita: e.target.value as PrioritaAvviso })}
                  >
                    <option value="NORMALE">Normale</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={editFormData.stato}
                    onChange={(e) => setEditFormData({ ...editFormData, stato: e.target.value as StatoAvviso })}
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
                  value={editFormData.categoria}
                  onChange={(e) => setEditFormData({ ...editFormData, categoria: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag (separati da virgola)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editFormData.tagsInput}
                  onChange={(e) => setEditFormData({ ...editFormData, tagsInput: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autore</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editFormData.autore}
                  onChange={(e) => setEditFormData({ ...editFormData, autore: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allegati (URL separati da virgola, facoltativo)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editFormData.allegatiInput}
                  onChange={(e) => setEditFormData({ ...editFormData, allegatiInput: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aggiungi nuovi file allegati</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setEditAttachmentFiles(Array.from(e.target.files || []))}
                />

                {editEmbeddedAttachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600">File già allegati ({editEmbeddedAttachments.length})</p>
                    <ul className="space-y-1">
                      {editEmbeddedAttachments.map((allegato, index) => (
                        <li
                          key={`${selectedAvviso?.id}-existing-file-${index}`}
                          className="flex items-center justify-between gap-2 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1"
                        >
                          <span className="text-gray-700 truncate">{getAttachmentLabel(allegato, index)}</span>
                          <button
                            type="button"
                            onClick={() => rimuoviFileAllegatoEsistente(index)}
                            className="text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
                          >
                            Rimuovi
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {editAttachmentFiles.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Nuovi file selezionati: {editAttachmentFiles.length}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenuto</label>
                <textarea
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={4}
                  value={editFormData.contenuto}
                  onChange={(e) => setEditFormData({ ...editFormData, contenuto: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={chiudiModificaAvviso}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition shadow"
                >
                  {isUpdating ? 'Salvataggio...' : 'Salva modifiche'}
                </button>
                <button
                  type="button"
                  onClick={eliminaAvvisoSelezionato}
                  disabled={isDeleting}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
                >
                  {isDeleting ? 'Eliminazione...' : 'Elimina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
