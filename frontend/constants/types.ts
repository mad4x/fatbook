export interface DocenteResponseDTO {
    id: number;
    nome: string;
    cognome: string;
    email: string;
    laboratorio: boolean;
    materieIds: number[];
    materie: string[];
}

export interface AssenzaResponseDTO {
    id: number;
    data: string;
    ora: number | null;
    motivazione: string;
    giornaliera: boolean;
    approvata: boolean;
    nomeDocente: string;
    cognomeDocente: string;
    emailDocente: string;
}

export interface SostituzioneSlotDTO {
    sostituzioneId: number | null;
    assenzaId: number;
    data: string;
    giorno: string;
    ora: number;
    classeId: number;
    classeNome: string;
    materia: string;
    aula: string | null;
    docenteAssenteId: number;
    docenteAssenteNome: string;
    docenteAssenteCognome: string;
    docenteAssenteEmail: string;
    docenteSostitutoId: number | null;
    docenteSostitutoNome: string | null;
    docenteSostitutoCognome: string | null;
    supplenteNome: string | null;
}

export interface DocenteDisponibilitaDTO {
    id: number;
    disponibile: boolean;
}

export interface DashboardSlotDTO {
    data: string;
    giorno: string;
    ora: number;
    classeNome: string;
    materia: string;
    aula: string | null;
    assenzaId: number | null;
    docenteAssenteNome: string | null;
    docenteAssenteCognome: string | null;
    docenteSostitutoNome: string | null;
    docenteSostitutoCognome: string | null;
    supplenteNome: string | null;
}

export interface DashboardStatsDTO {
    oreTotali: number;
    oreAssenza: number;
    orePresenza: number;
    percentualeAssenza: number;
}

export interface DashboardWeeklyDTO {
    slots: DashboardSlotDTO[];
    stats: DashboardStatsDTO;
}

export interface SostituzioneDocenteStatsDTO {
    docenteId: number;
    nome: string;
    cognome: string;
    email: string;
    oreTotali: number;
    oreAssenza: number;
    orePresenza: number;
    oreSostituzione: number;
    percentualeAssenza: number;
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
    lettoDaUtente?: boolean;
    lettureCount?: number;
}

export interface AvvisoLettura {
    id: number;
    nome: string;
    cognome: string;
    email: string;
    lettoAt: string;
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