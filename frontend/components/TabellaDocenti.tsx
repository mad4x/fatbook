import { Pencil, Trash2 } from 'lucide-react';
import {DocenteResponseDTO} from "@/constants/types";

interface TabellaDocentiProps {
    docenti: DocenteResponseDTO[];
    onElimina: (id: number) => void;
    onModifica: (docente: DocenteResponseDTO) => void;
}

const TabellaDocenti = ({ docenti, onElimina, onModifica }: TabellaDocentiProps)=> {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-200 font-medium">
                <tr>
                    <th className="p-4">Anagrafica</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Materie Insegnate</th>
                    <th className="p-4 text-center">Azioni</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {docenti.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-slate-400">
                            Nessun docente registrato. Clicca su &quot;Nuovo Docente&quot; per iniziare.
                        </td>
                    </tr>
                ) : (
                    docenti.map((docente) => (
                        <tr key={docente.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                            <td className="p-4">
                                <div className="font-medium text-gray-800 dark:text-slate-100">
                                    {docente.nome} {docente.cognome}
                                </div>
                                {docente.laboratorio && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 text-xs font-medium rounded-md">
                                            ITP - Laboratorio
                                        </span>
                                )}
                            </td>
                            <td className="p-4 text-gray-500 dark:text-slate-300">{docente.email}</td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                    {docente.materie && docente.materie.length > 0 ? (
                                        docente.materie.map((materia, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 border border-blue-100 dark:border-blue-900 text-xs rounded-md">
                                                    {materia}
                                                </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 dark:text-slate-500 text-sm italic">Nessuna materia</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Modifica docente"
                                        onClick={() => onModifica(docente)}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Elimina docente"
                                        onClick={() => onElimina(docente.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}

export default TabellaDocenti;