import { Trash2 } from 'lucide-react';
import {DocenteResponseDTO} from "@/constants/types";

interface TabellaDocentiProps {
    docenti: DocenteResponseDTO[];
    // onElimina: (id: number) => void; // <-- Già pronto per il futuro!
}

const TabellaDocenti = ({ docenti }: TabellaDocentiProps)=> {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                <tr>
                    <th className="p-4">Anagrafica</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Materie Insegnate</th>
                    <th className="p-4 text-center">Azioni</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {docenti.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                            Nessun docente registrato. Clicca su "Nuovo Docente" per iniziare.
                        </td>
                    </tr>
                ) : (
                    docenti.map((docente) => (
                        <tr key={docente.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="font-medium text-gray-800">
                                    {docente.nome} {docente.cognome}
                                </div>
                                {docente.laboratorio && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-md">
                                            ITP - Laboratorio
                                        </span>
                                )}
                            </td>
                            <td className="p-4 text-gray-500">{docente.email}</td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                    {docente.materie && docente.materie.length > 0 ? (
                                        docente.materie.map((materia, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs rounded-md">
                                                    {materia}
                                                </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-sm italic">Nessuna materia</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 flex justify-center">
                                <button
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Elimina docente"
                                    // onClick={() => onElimina(docente.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
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