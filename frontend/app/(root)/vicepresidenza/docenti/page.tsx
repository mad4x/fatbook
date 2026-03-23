"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import { getBaseUrl } from "@/lib/api-url";
import { fetchWithAuth } from "@/lib/jwt";
import TabellaDocenti from "@/components/TabellaDocenti";
import { DocenteResponseDTO } from "@/constants/types";

const GestioneDocenti = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [materie, setMaterie] = useState<{id: number, nome: string}[]>([]);
    const [docenti, setDocenti] = useState<DocenteResponseDTO[]>([]);
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        laboratorio: false,
        materieIds: [] as number[]
    });
    const [error, setError] = useState("");

    // la definiamo fuori da useEffect perchè la usiamo più volte
    // c'è useCallback per non doverla ricaricare ogni volta per intero
    const fetchDocenti = useCallback(async () => {
        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/docenti`);
            if (response.ok) {
                const data = await response.json();
                setDocenti(data);
            }
        } catch (error) {
            console.error("Errore nel caricamento dei docenti", error);
        }
    }, []);

    useEffect(() => {
        const fetchMaterie = async () => {
            try {
                const response = await fetchWithAuth(`${getBaseUrl()}/materie`);
                if (response.ok) {
                    const data = await response.json();
                    setMaterie(data);
                }
            } catch (error) {
                console.error("Errore nel caricamento delle materie", error);
            }
        };

        const loadInitialData = async () => {
            await fetchMaterie();
            await fetchDocenti();
        };

        loadInitialData();
    }, [fetchDocenti]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMateriaToggle = (id: number) => {
        setFormData(prev => {
            const isSelected = prev.materieIds.includes(id);
            if (isSelected) {
                return { ...prev, materieIds: prev.materieIds.filter(mId => mId !== id) };
            } else {
                return { ...prev, materieIds: [...prev.materieIds, id] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/docente`, {
                method: "POST",
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsModalOpen(false);
                setFormData({ nome: '', cognome: '', email: '', laboratorio: false, materieIds: [] });

                // Aggiorniamo la tabella ricaricando i dati dal server
                await fetchDocenti();
            } else {
                setError("Impossibile salvare il docente. Riprova.");
            }
        } catch (error) {
            console.error("Errore submit:", error);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto w-full h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Docenti</h1>
                    <p className="text-gray-500 mt-1">Gestisci il corpo docenti dell'istituto</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Nuovo Docente
                </button>
            </div>

            <TabellaDocenti docenti={docenti} />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Aggiungi nuovo docente"
            >
                {/* IL FORM RIMANE ESATTAMENTE UGUALE A PRIMA */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input type="text" name="nome" required value={formData.nome} onChange={handleChange}
                                       className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                                <input type="text" name="cognome" required value={formData.cognome} onChange={handleChange}
                                       className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Istituzionale</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                   className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Materie Insegnate</label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-48 overflow-y-auto">
                                {materie.map(materia => (
                                    <label key={materia.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.materieIds.includes(materia.id)}
                                            onChange={() => handleMateriaToggle(materia.id)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{materia.nome}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors mt-4">
                            <input type="checkbox" name="laboratorio" checked={formData.laboratorio} onChange={handleChange}
                                   className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                            <div>
                                <p className="font-medium text-gray-800">Docente Tecnico Pratico (ITP)</p>
                                <p className="text-xs text-gray-500">Spunta se il docente insegna solo in laboratorio</p>
                            </div>
                        </label>
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
                            Salva Docente
                        </button>
                    </div>

                </form>
            </Modal>
        </div>
    );
}

export default GestioneDocenti;