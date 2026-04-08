"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import ModalConferma from '@/components/ModalConferma';
import { getBaseUrl } from "@/lib/api-url";
import { fetchWithAuth } from "@/lib/jwt";
import {AssenzaResponseDTO, DocenteResponseDTO} from "@/constants/types";

const GestioneAssenze = () => {
    // Otteniamo la data di oggi in formato YYYY-MM-DD
    const oggi = new Date().toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState(oggi);
    const [assenze, setAssenze] = useState<AssenzaResponseDTO[]>([]);
    const [docenti, setDocenti] = useState<DocenteResponseDTO[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        docenteId: '',
        data: oggi,
        motivazione: '',
        giornaliera: true,
        ora: '' as number | string,
        uscitaDidatticaId: null
    });
    const [error, setError] = useState("");

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

    // Effetti al mount e al cambio data
    useEffect(() => {
        fetchDocenti();
    }, []);

    useEffect(() => {
        fetchAssenze();
    }, [fetchAssenze]);

    // Gestione input form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked, ora: checked ? '' : prev.ora }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Apri modale e precompila la data
    const handleOpenModal = () => {
        setFormData(prev => ({ ...prev, data: selectedDate, docenteId: '', motivazione: '', giornaliera: true, ora: '' }));
        setError("");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prepariamo il payload, convertendo l'ID e gestendo i null
        const payload = {
            docenteId: Number(formData.docenteId),
            data: formData.data,
            motivazione: formData.motivazione,
            giornaliera: formData.giornaliera,
            ora: formData.giornaliera ? null : Number(formData.ora),
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
                setError("Impossibile salvare l'assenza. Verifica i dati.");
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

    return (
        <div className="p-8 max-w-5xl mx-auto w-full h-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Registro Assenze</h1>
                    <p className="text-gray-500 mt-1">Consulta e registra le assenze dei docenti</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Date Picker integrato nella header */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Calendar className="w-5 h-5 text-gray-500" />
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm"
                        />
                    </div>

                    <button
                        onClick={handleOpenModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Registra Assenza
                    </button>
                </div>
            </div>

            {/* TABELLA ASSENZE (Puoi estrarla in un componente TabellaAssenze.tsx) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {assenze.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-700">Nessuna assenza registrata</p>
                        <p className="text-sm">Tutti i docenti sono presenti in questa data.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Docente</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Motivazione</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Azioni</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {assenze.map((assenza) => (
                                <tr key={assenza.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-gray-900">{assenza.nomeDocente} {assenza.cognomeDocente}</div>
                                        <div className="text-sm text-gray-500">{assenza.emailDocente}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {assenza.giornaliera ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                    <Calendar size={14} /> Giornaliera
                                                </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    <Clock size={14} /> {assenza.ora}ª Ora
                                                </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600">
                                        {assenza.motivazione || "-"}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => { setAssenzaDaEliminare(assenza.id); setDeleteError(""); }}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Docente Assente</label>
                            <select
                                name="docenteId"
                                required
                                value={formData.docenteId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <input
                                    type="date"
                                    name="data"
                                    required
                                    value={formData.data}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
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
                                    <span className="font-medium text-gray-800">Intera giornata</span>
                                </label>
                            </div>
                        </div>

                        {/* Appare dinamicamente solo se togli la spunta a "Intera giornata" */}
                        {!formData.giornaliera && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                <label className="block text-sm font-medium text-amber-900 mb-1">Specifica l&apos;ora di assenza</label>
                                <input
                                    type="number"
                                    name="ora"
                                    required={!formData.giornaliera}
                                    min="1"
                                    max="8"
                                    value={formData.ora}
                                    onChange={handleChange}
                                    placeholder="Es: 1, 2, 3..."
                                    className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Motivazione (opzionale)</label>
                            <input
                                type="text"
                                name="motivazione"
                                value={formData.motivazione}
                                onChange={handleChange}
                                placeholder="Es: Febbre, Permesso retribuito..."
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
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
}

export default GestioneAssenze;