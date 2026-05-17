"use client";

import { useState, useEffect, useCallback } from 'react';
import VicepresideBack from "@/components/ui/vicepreside-back";
import { Plus, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import ModalConferma from '@/components/ModalConferma';
import { getBaseUrl } from "@/lib/api-url";
import { fetchWithAuth } from "@/lib/jwt";
import {AssenzaResponseDTO, DocenteResponseDTO} from "@/constants/types";

const GestioneAssenze = () => {
    // Otteniamo la data di oggi in formato YYYY-MM-DD
    const oggi = new Date().toLocaleDateString('en-CA');

    const [selectedDate, setSelectedDate] = useState(oggi);
    const [assenze, setAssenze] = useState<AssenzaResponseDTO[]>([]);
    const [richieste, setRichieste] = useState<AssenzaResponseDTO[]>([]);
    const [docenti, setDocenti] = useState<DocenteResponseDTO[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        docenteId: '',
        data: oggi,
        dataFine: '',
        multiDay: false,
        motivazione: '',
        giornaliera: true,
        ora: '' as number | string,
        uscitaDidatticaId: null
    });
    const [error, setError] = useState("");
    const [richiesteError, setRichiesteError] = useState("");

    const [assenzaDaEliminare, setAssenzaDaEliminare] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState("");

    // Carica i docenti (serve per la select nel modale)
    const fetchDocenti = async () => {
        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/docenti`);
            if (response.ok) {
                const data = await response.json();
                setDocenti(data);
            }
        } catch (error) {
            console.error("Errore nel caricamento dei docenti", error);
        }
    };

    // Carica le assenze per la data selezionata
    const fetchAssenze = useCallback(async () => {
        try {
            // Assicurati che l'endpoint backend corrisponda a questo!
            // Potrebbe essere /assenze?data=YYYY-MM-DD oppure /assenze/giorno/YYYY-MM-DD
            const response = await fetchWithAuth(`${getBaseUrl()}/assenze?data=${selectedDate}`);
            if (response.ok) {
                const data = await response.json();
                setAssenze(data);
            }
        } catch (error) {
            console.error("Errore nel caricamento delle assenze", error);
        }
    }, [selectedDate]);

    const fetchRichieste = useCallback(async () => {
        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/assenze/richieste`);
            if (response.ok) {
                const data = await response.json();
                setRichieste(data);
            } else {
                setRichiesteError("Impossibile caricare le richieste.");
            }
        } catch (error) {
            console.error("Errore nel caricamento delle richieste", error);
            setRichiesteError("Errore di rete durante il caricamento delle richieste.");
        }
    }, []);

    // Effetti al mount e al cambio data
    useEffect(() => {
        fetchDocenti();
    }, []);

    useEffect(() => {
        fetchAssenze();
    }, [fetchAssenze]);

    useEffect(() => {
        fetchRichieste();
    }, [fetchRichieste]);

    // Gestione input form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            if (name === 'giornaliera') {
                setFormData(prev => ({ ...prev, giornaliera: checked, ora: checked ? '' : prev.ora }));
                return;
            }

            if (name === 'multiDay') {
                setFormData(prev => ({
                    ...prev,
                    multiDay: checked,
                    dataFine: checked ? (prev.dataFine || prev.data) : ''
                }));
                return;
            }

            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        if (name === 'data') {
            setFormData(prev => {
                const nextDataFine = prev.multiDay && prev.dataFine && prev.dataFine < value ? value : prev.dataFine;
                return { ...prev, data: value, dataFine: nextDataFine };
            });
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Apri modale e precompila la data
    const handleOpenModal = () => {
        setFormData(prev => ({
            ...prev,
            data: selectedDate,
            dataFine: '',
            multiDay: false,
            docenteId: '',
            motivazione: '',
            giornaliera: true,
            ora: ''
        }));
        setError("");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");

        if (formData.multiDay && !formData.dataFine) {
            setError("Seleziona una data fine per l'assenza su più giorni.");
            return;
        }

        // Prepariamo il payload, convertendo l'ID e gestendo i null
        const payload = {
            docenteId: Number(formData.docenteId),
            data: formData.data,
            dataFine: formData.multiDay ? formData.dataFine : null,
            motivazione: formData.motivazione,
            giornaliera: formData.giornaliera,
            ora: formData.giornaliera ? null : (formData.ora === '' ? null : Number(formData.ora)),
            uscitaDidatticaId: null // Aggiungi la gestione gite in futuro se serve
        };

        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/assenze`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setIsModalOpen(false);
                await fetchAssenze(); // Ricarichiamo la tabella
            } else {
                const errorText = await response.text();
                if (errorText.includes("Esiste gia un'assenza")) {
                    setError("Esiste gia un'assenza per questa ora o per questo giorno.");
                } else {
                    setError(errorText || "Impossibile salvare l'assenza. Verifica i dati.");
                }
            }
        } catch (error) {
            console.error("Errore submit:", error);
            setError("Errore di rete durante il salvataggio.");
        }
    };

    const confermaEliminazione = async () => {
        if (!assenzaDaEliminare) return;
        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/assenze/${assenzaDaEliminare}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setAssenzaDaEliminare(null);
                await fetchAssenze();
            } else {
                setDeleteError("Impossibile eliminare l'assenza.");
            }
        } catch (error) {
            setDeleteError("Si è verificato un errore di rete.");
        }
    };

    const approvaRichiesta = async (id: number) => {
        setRichiesteError("");
        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/assenze/richieste/${id}/approva`, {
                method: "POST"
            });

            if (response.ok) {
                await Promise.all([fetchRichieste(), fetchAssenze()]);
            } else {
                const errorText = await response.text();
                setRichiesteError(errorText || "Impossibile approvare la richiesta.");
            }
        } catch (error) {
            setRichiesteError("Errore di rete durante l'approvazione.");
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto w-full h-full">
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Registro Assenze</h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">Consulta e registra le assenze dei docenti</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Date Picker integrato nella header */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Calendar className="w-5 h-5 text-gray-500 dark:text-slate-300" />
                            </div>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm"
                            />
                        </div>

                        <button
                            onClick={handleOpenModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus size={20} />
                            Registra Assenza
                        </button>
                        <VicepresideBack />
                    </div>
                </div>
            </div>

            {/* TABELLA ASSENZE (Puoi estrarla in un componente TabellaAssenze.tsx) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Richieste di assenza</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Da approvare</p>
                </div>

                {richiesteError && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-200 text-sm rounded-lg border border-red-100 dark:border-red-500/30">
                        {richiesteError}
                    </div>
                )}

                {richieste.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                        Nessuna richiesta in attesa.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Docente</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Data</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Tipo</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-right">Azioni</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {richieste.map((richiesta) => (
                                <tr key={richiesta.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="py-3 px-6">
                                        <div className="font-medium text-gray-900 dark:text-slate-100">
                                            {richiesta.nomeDocente} {richiesta.cognomeDocente}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-slate-400">{richiesta.emailDocente}</div>
                                    </td>
                                    <td className="py-3 px-6 text-sm text-gray-600 dark:text-slate-300">{richiesta.data}</td>
                                    <td className="py-3 px-6">
                                        {richiesta.giornaliera ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200">
                                                <Calendar size={14} />
                                                {richiesta.ora ? `Giornaliera - ${richiesta.ora}ª Ora` : 'Giornaliera'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200">
                                                <Clock size={14} /> {richiesta.ora}ª Ora
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-6 text-right">
                                        <button
                                            onClick={() => approvaRichiesta(richiesta.id)}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                                        >
                                            Approva
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                {assenze.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-slate-400 flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
                        <p className="text-lg font-medium text-gray-700 dark:text-slate-200">Nessuna assenza registrata</p>
                        <p className="text-sm">Tutti i docenti sono presenti in questa data.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Docente</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Tipo</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Motivazione</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-right">Azioni</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {assenze.map((assenza) => (
                                <tr key={assenza.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-gray-900 dark:text-slate-100">{assenza.nomeDocente} {assenza.cognomeDocente}</div>
                                        <div className="text-sm text-gray-500 dark:text-slate-400">{assenza.emailDocente}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {assenza.giornaliera ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200">
                                                <Calendar size={14} />
                                                {assenza.ora ? `Giornaliera - ${assenza.ora}ª Ora` : 'Giornaliera'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200">
                                                <Clock size={14} /> {assenza.ora}ª Ora
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-slate-300">
                                        {assenza.motivazione || "-"}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => { setAssenzaDaEliminare(assenza.id); setDeleteError(""); }}
                                            className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors inline-flex items-center justify-center"
                                            title="Elimina assenza"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODALE INSERIMENTO */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registra Nuova Assenza"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-5">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Docente Assente</label>
                            <select
                                name="docenteId"
                                required
                                value={formData.docenteId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
                            >
                                <option value="" disabled>-- Seleziona un docente --</option>
                                {docenti.map(docente => (
                                    <option key={docente.id} value={docente.id}>
                                        {docente.cognome} {docente.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Data</label>
                                <input
                                    type="date"
                                    name="data"
                                    required
                                    value={formData.data}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
                                />
                            </div>

                            <div className="flex flex-col justify-center pt-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="giornaliera"
                                        checked={formData.giornaliera}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-800 dark:text-slate-100">Intera giornata</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col justify-center">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="multiDay"
                                        checked={formData.multiDay}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-800 dark:text-slate-100">Più giorni</span>
                                </label>
                            </div>

                            {formData.multiDay && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Data fine</label>
                                    <input
                                        type="date"
                                        name="dataFine"
                                        required={formData.multiDay}
                                        min={formData.data}
                                        value={formData.dataFine}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Appare dinamicamente solo se togli la spunta a "Intera giornata" */}
                        {!formData.giornaliera && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 rounded-xl">
                                <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Specifica l&apos;ora di assenza</label>
                                <input
                                    type="number"
                                    name="ora"
                                    required={!formData.giornaliera}
                                    min="1"
                                    max="8"
                                    value={formData.ora}
                                    onChange={handleChange}
                                    placeholder="Es: 1, 2, 3..."
                                    className="w-full border border-amber-200 dark:border-amber-500/40 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Motivazione (opzionale)</label>
                            <input
                                type="text"
                                name="motivazione"
                                value={formData.motivazione}
                                onChange={handleChange}
                                placeholder="Es: Febbre, Permesso retribuito..."
                                className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-200 text-sm rounded-lg border border-red-100 dark:border-red-500/30">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-gray-600 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
                            Annulla
                        </button>
                        <button type="submit"
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-colors">
                            Registra
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODALE ELIMINAZIONE */}
            <ModalConferma
                isOpen={assenzaDaEliminare !== null}
                onClose={() => { setAssenzaDaEliminare(null); setDeleteError(""); }}
                onConfirm={confermaEliminazione}
                titolo="Elimina Assenza"
                messaggio="Sei sicuro di voler eliminare questa assenza? L'azione non può essere annullata."
                testoPulsante="Sì, Elimina"
                errore={deleteError}
            />
        </div>
    );
};

export default GestioneAssenze;