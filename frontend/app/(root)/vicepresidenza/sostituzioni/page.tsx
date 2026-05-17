"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle2, UserPlus, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "@/components/Modal";
import { getBaseUrl } from "@/lib/api-url";
import { fetchWithAuth } from "@/lib/jwt";
import {
    DocenteDisponibilitaDTO,
    DocenteResponseDTO,
    SostituzioneDocenteStatsDTO,
    SostituzioneSlotDTO,
} from "@/constants/types";

const SostituzioniPage = () => {
    const oggi = new Date().toLocaleDateString("en-CA");

    const [selectedDate, setSelectedDate] = useState(oggi);
    const [slots, setSlots] = useState<SostituzioneSlotDTO[]>([]);
    const [docenti, setDocenti] = useState<DocenteResponseDTO[]>([]);
    const [stats, setStats] = useState<SostituzioneDocenteStatsDTO[]>([]);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<SostituzioneSlotDTO | null>(null);
    const [availableDocenti, setAvailableDocenti] = useState<DocenteResponseDTO[]>([]);
    const [formData, setFormData] = useState({
        docenteSostitutoId: "",
    });

    const docentiById = useMemo(() => {
        const map = new Map<number, DocenteResponseDTO>();
        docenti.forEach((docente) => map.set(docente.id, docente));
        return map;
    }, [docenti]);

    const fetchSlots = useCallback(async () => {
        setError("");
        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/sostituzioni?data=${selectedDate}`);
            if (response.ok) {
                const data = await response.json();
                setSlots(data);
            } else {
                setError("Impossibile caricare le sostituzioni.");
            }
        } catch (err) {
            setError("Errore di rete durante il caricamento delle sostituzioni.");
        }
    }, [selectedDate]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/sostituzioni/stats?date=${selectedDate}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Errore nel caricamento statistiche", err);
        }
    }, [selectedDate]);

    const fetchDocenti = useCallback(async () => {
        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/docenti`);
            if (response.ok) {
                const data = await response.json();
                setDocenti(data);
            }
        } catch (err) {
            console.error("Errore nel caricamento docenti", err);
        }
    }, []);

    useEffect(() => {
        fetchDocenti();
    }, [fetchDocenti]);

    useEffect(() => {
        fetchSlots();
        fetchStats();
    }, [fetchSlots, fetchStats]);

    const openAssignModal = async (slot: SostituzioneSlotDTO) => {
        setSelectedSlot(slot);
        setFormData({
            docenteSostitutoId: slot.docenteSostitutoId ? String(slot.docenteSostitutoId) : "",
        });

        try {
            const response = await fetchWithAuth(
                `${getBaseUrl()}/vicepresidenza/docenti/disponibilita?giorno=${slot.giorno}&ora=${slot.ora}&classeId=${slot.classeId}`
            );
            if (response.ok) {
                const data: DocenteDisponibilitaDTO[] = await response.json();
                const disponibili = data
                    .filter((item) => item.disponibile)
                    .map((item) => docentiById.get(item.id))
                    .filter((item): item is DocenteResponseDTO => Boolean(item))
                    .filter((docente) => docente.id !== slot.docenteAssenteId);

                setAvailableDocenti(disponibili);
                if (!slot.supplenteNome && disponibili.length > 0 && !slot.docenteSostitutoId) {
                    setFormData((prev) => ({ ...prev, docenteSostitutoId: String(disponibili[0].id) }));
                }
            } else {
                setAvailableDocenti([]);
            }
        } catch (err) {
            setAvailableDocenti([]);
        }

        setIsModalOpen(true);
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) {
            return;
        }

        if (!formData.docenteSostitutoId) {
            setError("Seleziona un docente disponibile.");
            return;
        }

        const payload = {
            assenzaId: selectedSlot.assenzaId,
            docenteSostitutoId: Number(formData.docenteSostitutoId),
            supplenteNome: null,
        };

        try {
            const response = await fetchWithAuth(
                `${getBaseUrl()}/vicepresidenza/sostituzioni?data=${selectedDate}`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            if (response.ok) {
                setIsModalOpen(false);
                await Promise.all([fetchSlots(), fetchStats()]);
            } else {
                const text = await response.text();
                setError(text || "Impossibile assegnare la sostituzione.");
            }
        } catch (err) {
            setError("Errore di rete durante l'assegnazione.");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto w-full h-full">
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Sostituzioni</h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">Gestisci le coperture delle assenze</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 text-sm rounded-xl px-3 py-2.5 shadow-sm">
                            <button
                                type="button"
                                onClick={() => {
                                    const date = new Date(selectedDate);
                                    date.setDate(date.getDate() - 1);
                                    setSelectedDate(date.toLocaleDateString("en-CA"));
                                }}
                                className="text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
                                aria-label="Giorno precedente"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500 dark:text-slate-300" />
                                <span className="text-sm">{selectedDate}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const date = new Date(selectedDate);
                                    date.setDate(date.getDate() + 1);
                                    setSelectedDate(date.toLocaleDateString("en-CA"));
                                }}
                                className="text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
                                aria-label="Giorno successivo"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-200 text-sm rounded-lg border border-red-100 dark:border-red-500/30">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                {slots.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-slate-400 flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
                        <p className="text-lg font-medium text-gray-700 dark:text-slate-200">Nessuna assenza da coprire</p>
                        <p className="text-sm">Non risultano slot scoperti in questa data.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Classe</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Ora</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Assente</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Materia</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Copertura</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-right">Azioni</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {slots.map((slot) => (
                                <tr key={`slot-${slot.assenzaId}`} className="hover:bg-gray-50/50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-slate-300">{slot.classeNome}</td>
                                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-slate-300">{slot.ora}ª</td>
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-gray-900 dark:text-slate-100">
                                            {slot.docenteAssenteNome} {slot.docenteAssenteCognome}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-slate-400">{slot.docenteAssenteEmail}</div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-slate-300">
                                        {slot.materia}
                                        {slot.aula ? ` · Aula ${slot.aula}` : ""}
                                    </td>
                                    <td className="py-4 px-6">
                                        {slot.docenteSostitutoId ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200">
                                                <CheckCircle2 size={14} />
                                                {slot.docenteSostitutoNome} {slot.docenteSostitutoCognome}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200">
                                                Slot scoperto
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => openAssignModal(slot)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors inline-flex items-center gap-2"
                                        >
                                            <UserPlus size={16} /> Gestisci
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Presenze e sostituzioni settimanali</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Ore totali, assenze e coperture</p>
                </div>

                {stats.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                        Nessuna statistica disponibile per questa settimana.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Docente</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Ore totali</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Presenza</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Assenza</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">Sostituzioni</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">% assenza</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {stats.map((item) => (
                                <tr key={`stats-${item.docenteId}`} className="hover:bg-gray-50/50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="py-3 px-6">
                                        <div className="font-medium text-gray-900 dark:text-slate-100">{item.cognome} {item.nome}</div>
                                        <div className="text-sm text-gray-500 dark:text-slate-400">{item.email}</div>
                                    </td>
                                    <td className="py-3 px-6 text-sm text-gray-600 dark:text-slate-300">{item.oreTotali}</td>
                                    <td className="py-3 px-6 text-sm text-gray-600 dark:text-slate-300">{item.orePresenza}</td>
                                    <td className="py-3 px-6 text-sm text-gray-600 dark:text-slate-300">{item.oreAssenza}</td>
                                    <td className="py-3 px-6 text-sm text-gray-600 dark:text-slate-300">{item.oreSostituzione}</td>
                                    <td className="py-3 px-6 text-sm text-gray-600 dark:text-slate-300">{item.percentualeAssenza.toFixed(1)}%</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Assegna sostituzione"
            >
                <form onSubmit={handleAssign} className="space-y-5">
                    {selectedSlot && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedSlot.classeNome} · {selectedSlot.ora}ª ora</p>
                            <p>{selectedSlot.docenteAssenteNome} {selectedSlot.docenteAssenteCognome} · {selectedSlot.materia}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Docente disponibile</label>
                        <select
                            value={formData.docenteSostitutoId}
                            onChange={(e) => setFormData((prev) => ({ ...prev, docenteSostitutoId: e.target.value }))}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                        >
                            <option value="">Seleziona docente</option>
                            {availableDocenti.map((docente) => (
                                <option key={docente.id} value={docente.id}>
                                    {docente.cognome} {docente.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-5 py-2.5 text-gray-600 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-colors"
                        >
                            Salva assegnazione
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SostituzioniPage;
