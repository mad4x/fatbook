import { Avviso, AvvisoFormData, AvvisoWritePayload, FiltroPrioritaAvviso, PrioritaAvviso, StatoAvviso } from '@/constants/types';

export const parseMultiValue = (input: string): string[] =>
  input
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export const normalizeList = (value: unknown): string[] => {
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

export const isDataAttachment = (value: string) => value.trim().toLowerCase().startsWith('data:');

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

export const toDataUrlList = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) {
    return [];
  }

  return Promise.all(files.map((file) => fileToDataUrl(file)));
};

export const getAttachmentLabel = (attachment: string, index: number) => {
  if (isDataAttachment(attachment)) {
    const mimeMatch = attachment.match(/^data:([^;]+);/i);
    const mime = mimeMatch?.[1] ?? 'file';
    return `Allegato file ${index + 1} (${mime})`;
  }

  return attachment;
};

export const normalizeAvviso = (raw: unknown): Avviso => {
  const value = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const priorita: PrioritaAvviso = value.priorita === 'ALTA' ? 'ALTA' : 'NORMALE';
  const stato: StatoAvviso = value.stato === 'BOZZA' ? 'BOZZA' : 'PUBBLICATO';

  return {
    id: Number(value.id ?? Date.now()),
    titolo: typeof value.titolo === 'string' ? value.titolo : '',
    contenuto: typeof value.contenuto === 'string' ? value.contenuto : '',
    dataCreazione: typeof value.dataCreazione === 'string' ? value.dataCreazione : '',
    dataAggiornamento: typeof value.dataAggiornamento === 'string' ? value.dataAggiornamento : null,
    autore: typeof value.autore === 'string' ? value.autore : '',
    priorita,
    stato,
    categoria: typeof value.categoria === 'string' && value.categoria.trim() ? value.categoria : 'Generale',
    tags: normalizeList(value.tags),
    allegati: normalizeList(value.allegati),
    creatoDa: typeof value.creatoDa === 'string' ? value.creatoDa : null,
    aggiornatoDa: typeof value.aggiornatoDa === 'string' ? value.aggiornatoDa : null
  };
};

export const toOpenableUrl = (value: string) => {
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

export const buildPayload = async (
  data: AvvisoFormData,
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

export const getFriendlyError = (err: unknown) => {
  if (err instanceof TypeError) {
    return 'NetworkError: impossibile contattare il server. Verifica connessione e backend attivo.';
  }
  return 'Si è verificato un errore inatteso. Riprova tra qualche secondo.';
};

export const formatDate = (dateIso?: string | null) => {
  if (!dateIso) {
    return '-';
  }
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString('it-IT');
};

export const filterAvvisi = (
  avvisi: Avviso[],
  searchTerm: string,
  filtroPriorita: FiltroPrioritaAvviso
) => {
  const ricerca = searchTerm.trim().toLowerCase();
  return avvisi.filter((avviso) => {
    const matchRicerca =
      avviso.titolo.toLowerCase().includes(ricerca) ||
      avviso.contenuto.toLowerCase().includes(ricerca) ||
      avviso.autore.toLowerCase().includes(ricerca) ||
      (avviso.categoria || '').toLowerCase().includes(ricerca) ||
      (avviso.tags || []).some((tag) => tag.toLowerCase().includes(ricerca));
    const matchPriorita = filtroPriorita === 'TUTTE' || avviso.priorita === filtroPriorita;
    return matchRicerca && matchPriorita;
  });
};
