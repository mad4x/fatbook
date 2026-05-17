"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Clock, AlertCircle, Plus, CheckCircle2, Hourglass, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "@/components/Modal";
import { getBaseUrl } from "@/lib/api-url";
import { fetchWithAuth } from "@/lib/jwt";
import { AssenzaResponseDTO } from "@/constants/types";

const AssenzeDocentePage = () => {
    const oggi = new Date().toLocaleDateString("en-CA");

    const [assenze, setAssenze] = useState<AssenzaResponseDTO[]>([]);
    const [selectedDate, setSelectedDate] = useState(oggi);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        data: oggi,
        dataFine: "",
        multiDay: false,
        motivazione: "",
        giornaliera: true,
        ora: "" as number | string
    });

    const fetchAssenze = useCallback(async () => {
        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/assenze/mie`);
            if (response.ok) {
                const data = await response.json();
                setAssenze(data);
            }
        } catch (error) {
            console.error("Errore nel caricamento delle assenze", error);
        }
    }, []);

    useEffect(() => {
        fetchAssenze();
    }, [fetchAssenze]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = e.target.checked;
            if (name === "giornaliera") {
                setFormData(prev => ({ ...prev, giornaliera: checked, ora: checked ? "" : prev.ora }));
                return;
            }

            if (name === "multiDay") {
                setFormData(prev => ({
                    ...prev,
                    multiDay: checked,
                    dataFine: checked ? (prev.dataFine || prev.data) : ""
                }));
                return;
            }

            return;
        }

        if (name === "data") {
            setFormData(prev => {
                const nextDataFine = prev.multiDay && prev.dataFine && prev.dataFine < value ? value : prev.dataFine;
                return { ...prev, data: value, dataFine: nextDataFine };
            });
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = () => {
        setFormData({
            data: oggi,
            dataFine: "",
            multiDay: false,
            motivazione: "",
            giornaliera: true,
            ora: ""
        });
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

        const today = new Date().toLocaleDateString("en-CA");
        if (formData.data < today) {
            setError("Non puoi richiedere assenze nel passato.");
            return;
        }

        const startDate = new Date(formData.data);
        const endDate = formData.multiDay && formData.dataFine ? new Date(formData.dataFine) : startDate;
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const day = date.getDay();
            if (day === 0 || day === 6) {
                setError("Non puoi richiedere assenze nel weekend.");
                return;
            }
        }

        const payload = {
            data: formData.data,
            dataFine: formData.multiDay ? formData.dataFine : null,
            motivazione: formData.motivazione,
            giornaliera: formData.giornaliera,
            ora: formData.giornaliera ? null : (formData.ora === "" ? null : Number(formData.ora))
        };

        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/assenze/richieste`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setIsModalOpen(false);
                await fetchAssenze();
            } else {
                const errorText = await response.text();
                if (errorText.includes("Esiste gia un'assenza")) {
                    setError("Hai gia richiesto un'assenza per questa ora o per questo giorno.");
                } else {
                    setError(errorText || "Impossibile inviare la richiesta.");
                }
            }
        } catch (error) {
            console.error("Errore submit:", error);
            setError("Errore di rete durante l'invio.");
        }
    };

    const getWeekDays = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDay();
        const offset = day === 0 ? -6 : 1 - day;
        const monday = new Date(date);
        monday.setDate(date.getDate() + offset);

        return Array.from({ length: 5 }, (_, index) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + index);
            return d.toLocaleDateString("en-CA");
        });
    };

    const weekDays = getWeekDays(selectedDate);
    const weekStart = weekDays[0];
    const weekEnd = weekDays[weekDays.length - 1];
    const hours = [1, 2, 3, 4, 5, 6, 7, 8];
    const assenzeBySlot = new Map<string, AssenzaResponseDTO[]>();

    assenze.forEach((assenza) => {
        if (!assenza.ora) {
            return;
        }

        const key = `${assenza.data}-${assenza.ora}`;
        if (!assenzeBySlot.has(key)) {
            assenzeBySlot.set(key, []);
        }
        assenzeBySlot.get(key)?.push(assenza);
    });

    return (
        <div className="p-8 max-w-5xl mx-auto w-full h-full">
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Le mie assenze</h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">Storico e richieste di assenza</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 text-sm rounded-xl px-3 py-2.5 shadow-sm">
                            <button
                                type="button"
                                onClick={() => {
                                    const date = new Date(selectedDate);
                                    date.setDate(date.getDate() - 7);
                                    setSelectedDate(date.toLocaleDateString("en-CA"));
                                }}
                                className="text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
                                aria-label="Settimana precedente"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500 dark:text-slate-300" />
                                <span className="text-sm">{weekStart} - {weekEnd}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const date = new Date(selectedDate);
                                    date.setDate(date.getDate() + 7);
                                    setSelectedDate(date.toLocaleDateString("en-CA"));
                                }}
                                className="text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
                                aria-label="Settimana successiva"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <button
                            onClick={handleOpenModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus size={20} />
                            Richiedi assenza
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                {assenze.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-slate-400 flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
                        <p className="text-lg font-medium text-gray-700 dark:text-slate-200">Nessuna assenza registrata</p>
                        <p className="text-sm">Non risultano assenze nel sistema.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-sm">
                            <thead>
                            <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                                <th className="border border-slate-200 dark:border-slate-800 px-3 py-2 text-left">Ora</th>
                                {weekDays.map((day) => (
                                    <th key={day} className="border border-slate-200 dark:border-slate-800 px-3 py-2 text-left">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody>
                            {hours.map((hour) => (
                                <tr key={`assenze-${hour}`}>
                                    <td className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                                        {hour}ª
                                    </td>

                                    {weekDays.map((day) => {
                                        const key = `${day}-${hour}`;
                                        const items = assenzeBySlot.get(key) ?? [];

                                        return (
                                            <td key={`assenze-${day}-${hour}`} className="border border-slate-200 dark:border-slate-800 px-3 py-2 align-top">
                                                {items.length === 0 ? (
                                                    <p className="font-medium text-slate-400 dark:text-slate-600">-</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {items.map((assenza) => (
                                                            <div
                                                                key={`assenza-${assenza.id}`}
                                                                className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1"
                                                            >
                                                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                                                    {assenza.giornaliera ? "Assenza" : "Assenza oraria"}
                                                                </p>
                                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                                    {assenza.motivazione || "-"}
                                                                </p>
                                                                <div className="mt-1">
                                                                    {assenza.approvata ? (
                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-200">
                                                                            <CheckCircle2 size={12} /> Approvata
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-200">
                                                                            <Hourglass size={12} /> In attesa
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
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
                title="Richiedi assenza"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
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
                            Invia richiesta
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AssenzeDocentePage;
