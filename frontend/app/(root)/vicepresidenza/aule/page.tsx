"use client";

import { useEffect, useState } from "react";
import VicepresideBack from "@/components/ui/vicepreside-back";
import ModalConferma from "@/components/ModalConferma";

import { getBaseUrl } from "@/lib/api-url";
import { fetchWithAuth } from "@/lib/jwt";

type Aula = {
  id: number;
  piano: number;
  numero: string;
  laboratorio: boolean;
};

export default function GestioneAulePage() {
  const [aule, setAule] = useState<Aula[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [newPiano, setNewPiano] = useState(0);
  const [newNumero, setNewNumero] = useState("");
  const [newLab, setNewLab] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPiano, setEditPiano] = useState(0);
  const [editNumero, setEditNumero] = useState("");
  const [editLab, setEditLab] = useState(false);
  const [aulaDaEliminare, setAulaDaEliminare] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const loadAule = async () => {
    const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/aule`);
    if (!response.ok) {
      throw new Error(`Errore API: ${response.status}`);
    }
    const data = (await response.json()) as Aula[];
    setAule(data.sort((a, b) => a.piano - b.piano || a.numero.localeCompare(b.numero)));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAule().catch((e) => setError(e.message));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="p-8 max-w-6xl mx-auto w-full h-full space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Gestione Aule</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Aggiungi aule, configura piani e tipologia laboratorio.</p>
        </div>
        <VicepresideBack />
      </header>

      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Piano</label>
          <input type="number" value={newPiano} onChange={(e) => setNewPiano(Number(e.target.value) || 0)} className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg p-2.5" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Numero aula</label>
          <input value={newNumero} onChange={(e) => setNewNumero(e.target.value)} className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg p-2.5" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
          <input type="checkbox" checked={newLab} onChange={(e) => setNewLab(e.target.checked)} />
          Laboratorio
        </label>
        <button
          onClick={() => {
            void (async () => {
              setError(null);
              const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/aule`, {
                method: "POST",
                body: JSON.stringify({ piano: newPiano, numero: newNumero.trim(), laboratorio: newLab }),
              });
              if (!response.ok) throw new Error(`Creazione fallita: ${response.status}`);
              setNewPiano(0);
              setNewNumero("");
              setNewLab(false);
              await loadAule();
            })().catch((e) => setError(e.message));
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg"
        >
          Aggiungi
        </button>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200">
            <tr>
              <th className="text-left px-4 py-3">Piano</th>
              <th className="text-left px-4 py-3">Aula</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {aule.map((aula) => (
              <tr key={aula.id} className="border-t border-gray-100 dark:border-slate-800">
                <td className="px-4 py-3">
                  {editingId === aula.id ? (
                    <input type="number" value={editPiano} onChange={(e) => setEditPiano(Number(e.target.value) || 0)} className="w-24 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg p-2" />
                  ) : (
                    aula.piano
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === aula.id ? (
                    <input value={editNumero} onChange={(e) => setEditNumero(e.target.value)} className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg p-2" />
                  ) : (
                    aula.numero
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === aula.id ? (
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                      <input type="checkbox" checked={editLab} onChange={(e) => setEditLab(e.target.checked)} />
                      Laboratorio
                    </label>
                  ) : aula.laboratorio ? "Laboratorio" : "Aula standard"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {editingId === aula.id ? (
                      <>
                        <button
                          onClick={() => {
                            void (async () => {
                              setError(null);
                              const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/aule/${aula.id}`, {
                                method: "PUT",
                                body: JSON.stringify({ piano: editPiano, numero: editNumero.trim(), laboratorio: editLab }),
                              });
                              if (!response.ok) throw new Error(`Aggiornamento fallito: ${response.status}`);
                              setEditingId(null);
                              await loadAule();
                            })().catch((e) => setError(e.message));
                          }}
                          className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Salva
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">Annulla</button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(aula.id);
                          setEditPiano(aula.piano);
                          setEditNumero(aula.numero);
                          setEditLab(aula.laboratorio);
                        }}
                        className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        Modifica
                      </button>
                    )}

                      <button
                      onClick={() => {
                        setAulaDaEliminare(aula.id);
                        setDeleteError("");
                      }}
                      className="px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Elimina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {aule.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-gray-500 dark:text-slate-400">Nessuna aula disponibile.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalConferma
        isOpen={aulaDaEliminare !== null}
        onClose={() => {
          setAulaDaEliminare(null);
          setDeleteError("");
        }}
        onConfirm={async () => {
          if (!aulaDaEliminare) return;
          try {
            const response = await fetchWithAuth(
              `${getBaseUrl()}/vicepresidenza/aule/${aulaDaEliminare}?cascade=true`,
              { method: "DELETE" },
            );
            if (!response.ok) {
              const text = await response.text();
              throw new Error(text || `Eliminazione fallita: ${response.status}`);
            }
            setAulaDaEliminare(null);
            await loadAule();
          } catch (e) {
            setDeleteError(e instanceof Error ? e.message : "Errore durante l'eliminazione");
          }
        }}
        titolo="Elimina Aula"
        messaggio="L'aula verra rimossa dagli orari. Materie e docenti assegnati rimarranno invariati."
        testoPulsante="Sì, elimina"
        errore={deleteError}
      />
    </section>
  );
}
