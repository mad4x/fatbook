"use client";

import React, { useState } from 'react';

// 1. IL CONTRATTO DATI (TypeScript)
// Reso più flessibile per accettare sia stringhe che oggetti da Spring Boot
export interface OraCanonicaDTO {
    giorno: string;
    numeroOra: number;
    materia: string;
    docenteTeoria?: any;
    docente_teoria?: any;
    docentePrincipale?: any;
    docente?: any;
    aula?: any;
    aula_id?: any;
    alternativa?: boolean;
}

type GiornoSettimana = 'LUNEDI' | 'MARTEDI' | 'MERCOLEDI' | 'GIOVEDI' | 'VENERDI';
type RigaOrario = Record<GiornoSettimana, OraCanonicaDTO[]>;

const Orario = () => {
    // 2. STATO DEL COMPONENTE
    const [selectedClass, setSelectedClass] = useState<string>('L');
    const [gridData, setGridData] = useState<RigaOrario[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const giorni: GiornoSettimana[] = ['LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI'];
    const orariFasce = [
        "08:30 - 09:20", "09:20 - 10:10", "10:20 - 11:15", "11:15 - 12:10", 
        "12:20 - 13:10", "13:10 - 14:00", "14:30 - 15:20", "15:20 - 16:10"
    ];

    // FUNZIONI HELPER (L'estrazione infallibile ripresa dal tuo HTML)
    const getDocente = (lezione: OraCanonicaDTO) => {
        let doc = lezione.docenteTeoria || lezione.docente_teoria || lezione.docentePrincipale || lezione.docente || null;
        if (doc && typeof doc === 'object') return doc.cognome || doc.nome || "Da Assegnare";
        if (typeof doc === 'string' && doc !== "-" && doc !== "") return doc;
        return "Da Assegnare";
    };

    const getAula = (lezione: OraCanonicaDTO) => {
        let au = lezione.aula || lezione.aula_id || null;
        if (au && typeof au === 'object') return au.numero || au.nome || au.id || "Da Assegnare";
        if (typeof au === 'string' && au !== "-" && au !== "") return au;
        return "Da Assegnare";
    };

    // 3. FUNZIONE DI CHIAMATA AL BACKEND
    const fetchTimetable = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`http://localhost:8080/api/orario/classe/${encodeURIComponent(selectedClass)}`);
            if (!response.ok) throw new Error("Errore di connessione al server");
            
            const data: OraCanonicaDTO[] = await response.json();
            
            // Creiamo la griglia vuota (8 ore x 5 giorni)
            const newGrid: RigaOrario[] = Array.from({ length: 8 }, () => ({
                LUNEDI: [], MARTEDI: [], MERCOLEDI: [], GIOVEDI: [], VENERDI: []
            }));

            // Riempiamo la griglia con i dati
            data.forEach((ora) => {
                if (ora.numeroOra >= 1 && ora.numeroOra <= 8) {
                    const giornoKey = ora.giorno as GiornoSettimana;
                    if (newGrid[ora.numeroOra - 1][giornoKey]) {
                        newGrid[ora.numeroOra - 1][giornoKey].push(ora);
                    }
                }
            });

            setGridData(newGrid);
        } catch (err: any) {
            console.error(err);
            setError("Impossibile caricare l'orario. Verifica che il backend sia acceso.");
        } finally {
            setIsLoading(false);
        }
    };

    // 4. INTERFACCIA GRAFICA
    return (
        <div className="w-full max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-slate-100 print:shadow-none print:border-none print:p-0">
            {/* INTESTAZIONE E CONTROLLI */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 print:mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 print:text-lg">Orario Lezioni - Classe 5{selectedClass}</h1>
                    <p className="text-slate-500 text-sm print:text-xs">Indirizzo: ITTS C. Grassi | Anno Scolastico 2025/2026</p>
                </div>
                
                {/* Bottoni e Select nascosti in fase di stampa grazie a print:hidden */}
                <div className="flex gap-2 print:hidden">
                    <select 
                        value={selectedClass} 
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="border border-slate-300 rounded px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                        <option value="A CD">Classe 5A CD</option>
                        <option value="B CT">Classe 5B CT</option>
                        <option value="C CD - CT">Classe 5C CD - CT</option>
                        <option value="C-CD">Classe 5C-CD</option>
                        <option value="L">Classe 5L</option>
                    </select>
                    
                    <button 
                        onClick={fetchTimetable} 
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        🔄 {isLoading ? 'Carico...' : 'Cerca'}
                    </button>

                    <button 
                        onClick={() => window.print()} 
                        className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center gap-2"
                    >
                        🖨️ Stampa A4
                    </button>
                </div>
            </div>

            {/* TABELLA */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 print:border-black print:overflow-visible">
                <table className="w-full text-center min-w-[800px] border-collapse print:min-w-full">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wide print:bg-gray-200 print:text-black print:text-xs">
                            <th className="p-3 border border-slate-200 print:border-black print:p-1 w-24">Ora</th>
                            <th className="p-3 border border-slate-200 print:border-black print:p-1 w-1/5">Lunedì</th>
                            <th className="p-3 border border-slate-200 print:border-black print:p-1 w-1/5">Martedì</th>
                            <th className="p-3 border border-slate-200 print:border-black print:p-1 w-1/5">Mercoledì</th>
                            <th className="p-3 border border-slate-200 print:border-black print:p-1 w-1/5">Giovedì</th>
                            <th className="p-3 border border-slate-200 print:border-black print:p-1 w-1/5">Venerdì</th>
                        </tr>
                    </thead>
                    <tbody>
                        {error && (
                            <tr className="print:hidden"><td colSpan={6} className="p-8 text-red-500 bg-red-50 font-bold">{error}</td></tr>
                        )}

                        {!gridData && !error && (
                            <tr className="print:hidden"><td colSpan={6} className="p-12 text-slate-500 text-lg">Seleziona una classe dal menu in alto e clicca su <strong>Cerca</strong>.</td></tr>
                        )}

                        {gridData && gridData.map((riga, index) => (
                            <React.Fragment key={`riga-${index}`}>
                                {/* Intervalli Mattutini */}
                                {(index === 2 || index === 4) && (
                                    <tr className="bg-yellow-50 text-yellow-700 text-sm font-semibold print:text-xs print:bg-yellow-100 print:text-black">
                                        <td className="p-2 border border-slate-200 print:border-black print:p-1">{index === 2 ? '10:10 - 10:20' : '12:10 - 12:20'}</td>
                                        <td colSpan={5} className="p-2 border border-slate-200 print:border-black print:p-1">Intervallo</td>
                                    </tr>
                                )}

                                {/* Pausa Pranzo */}
                                {(index === 6) && (
                                    <tr className="bg-orange-50 text-orange-800 text-sm font-semibold print:text-xs print:bg-orange-100 print:text-black">
                                        <td className="p-2 border border-slate-200 print:border-black print:p-1">14:00 - 14:30</td>
                                        <td colSpan={5} className="p-2 border border-slate-200 print:border-black print:p-1">Pausa Pranzo</td>
                                    </tr>
                                )}

                                <tr className="hover:bg-slate-50 transition-colors print:text-xs">
                                    <td className="p-2 border border-slate-200 bg-slate-50 font-bold text-slate-800 print:border-black print:p-1 print:bg-white">
                                        {index + 1}° Ora<br/><span className="text-xs font-normal text-slate-500 print:text-black">{orariFasce[index]}</span>
                                    </td>

                                    {giorni.map(giorno => {
                                        const lezioni = riga[giorno];
                                        if (!lezioni || lezioni.length === 0 || lezioni[0].materia.includes("Ora libera")) {
                                            return <td key={`${index}-${giorno}`} className="p-2 border border-slate-200 bg-slate-50/50 print:border-black print:bg-white"></td>;
                                        }

                                        return (
                                            <td key={`${index}-${giorno}`} className="p-2 border border-slate-200 align-top print:border-black print:p-1">
                                                {lezioni.map((lezione, i) => (
                                                    <div key={i} className="flex flex-col gap-1 text-sm pb-1 print:text-[10px] print:leading-tight">
                                                        <span className="font-bold text-slate-800 print:text-black">{lezione.materia}</span>
                                                        <span className="text-xs text-slate-700 print:text-black">👨‍🏫 {getDocente(lezione)}</span>
                                                        <span className="text-xs text-black font-semibold">📍 Aula: {getAula(lezione)}</span>
                                                        {i < lezioni.length - 1 && <hr className="my-1 border-slate-200 border-dashed print:border-black" />}
                                                    </div>
                                                ))}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Orario;