export interface DocenteResponseDTO {
    id: number;
    nome: string;
    cognome: string;
    email: string;
    laboratorio: boolean;
    materie: string[];
}

export interface AssenzaResponseDTO {
    id: number;
    data: string;
    ora: number | null;
    motivazione: string;
    giornaliera: boolean;
    nomeDocente: string;
    cognomeDocente: string;
    emailDocente: string;
}

export type PrioritaAvviso = 'NORMALE' | 'ALTA';
export type StatoAvviso = 'BOZZA' | 'PUBBLICATO';
export type FiltroPrioritaAvviso = 'TUTTE' | PrioritaAvviso;

export interface Avviso {
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

export interface AvvisoFormData {
    titolo: string;
    contenuto: string;
    autore: string;
    categoria: string;
    priorita: PrioritaAvviso;
    stato: StatoAvviso;
    tagsInput: string;
    allegatiInput: string;
}

export interface AvvisoWritePayload {
    titolo: string;
    contenuto: string;
    autore: string;
    categoria: string;
    priorita: PrioritaAvviso;
    stato: StatoAvviso;
    tags: string[];
    allegati: string[];
}

export const AVVISO_INITIAL_FORM_DATA: AvvisoFormData = {
    titolo: '',
    contenuto: '',
    autore: '',
    categoria: 'Generale',
    priorita: 'NORMALE',
    stato: 'PUBBLICATO',
    tagsInput: '',
    allegatiInput: ''
};