"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import {getBaseUrl} from "@/lib/api-url";
import {fetchWithAuth} from "@/lib/jwt"; // Assicurati che il percorso verso il tuo componente sia corretto

export default function GestioneDocenti() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [materie, setMaterie] = useState<{id: number, nome: string}[]>([]);

    // Lo stato che conterrà i dati del nostro form, esattamente come li aspetta il backend
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        laboratorio: false,
        materieIds: [] as number[] // Array di ID per le materie
    });

    // Simuliamo il caricamento delle materie all'apertura della pagina
    useEffect(() => {
        const fetchMaterie = async () => {
            try {
                const response = await fetchWithAuth(`${getBaseUrl()}/materie`);
                const data = await response.json();
                setMaterie(data);
            } catch (error) {
                console.error("Errore nel caricamento delle materie", error);
            }
        };
        fetchMaterie();
    }, []);

    // Gestisce i cambiamenti nei campi di testo e nella singola checkbox del laboratorio
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Gestisce l'aggiunta o la rimozione degli ID delle materie dall'array
    const handleMateriaToggle = (id: number) => {
        setFormData(prev => {
            const isSelected = prev.materieIds.includes(id);
            if (isSelected) {
                // Se c'era già, la togliamo
                return { ...prev, materieIds: prev.materieIds.filter(mId => mId !== id) };
            } else {
                // Se non c'era, la aggiungiamo
                return { ...prev, materieIds: [...prev.materieIds, id] };
            }
        });
    };

    // L'invio vero e proprio al nostro backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Inviando al backend il JSON:", JSON.stringify(formData, null, 2));

            await fetchWithAuth(`${getBaseUrl()}/vicepreside/docente`, {
            method: "POST",
            body: JSON.stringify(formData)
        });
        setIsModalOpen(false);
        setFormData({ nome: '', cognome: '', email: '', laboratorio: false, materieIds: [] });
    };

    return (
        <div className="p-8 max-w-5xl mx-auto w-full h-full">
            {/* Header della pagina */}
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

            {/* Lista dei docenti (UI temporanea in attesa della GET /docenti) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                    <tr>
                        <th className="p-4">Nome e Cognome</th>
                        <th className="p-4">Email</th>
                        <th className="p-4 text-center">Azioni</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">Felicia Maunero</td>
                        <td className="p-4 text-gray-500">femau@itisgrassi.edu.it</td>
                        <td className="p-4 flex justify-center">
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Elimina docente">
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            {/* IL NOSTRO NUOVO COMPONENTE MODALE */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Aggiungi nuovo docente"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">

                        {/* Nome e Cognome */}
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

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Istituzionale</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                   className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                        </div>

                        {/* Scelta delle materie (Checkboxes dinamiche) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Materie Insegnate</label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
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

                        {/* Checkbox Laboratorio (ITP) */}
                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors mt-4">
                            <input type="checkbox" name="laboratorio" checked={formData.laboratorio} onChange={handleChange}
                                   className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                            <div>
                                <p className="font-medium text-gray-800">Docente Tecnico Pratico (ITP)</p>
                                <p className="text-xs text-gray-500">Spunta se il docente insegna solo in laboratorio</p>
                            </div>
                        </label>

                    </div>

                    {/* Bottoni del form */}
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