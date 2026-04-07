"use client";

import { useEffect, useState } from "react";

import { getBaseUrl } from "@/lib/api-url";
import { fetchWithAuth } from "@/lib/jwt";

type Materia = {
  id: number;
  nome: string;
  descrizione: string;
};

export default function GestioneMateriePage() {
  const [materie, setMaterie] = useState<Materia[]>([]);
  const [nome, setNome] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescrizione, setEditDescrizione] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadMaterie = async () => {
    const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/materie`);
    if (!response.ok) {
      throw new Error(`Errore API: ${response.status}`);
    }
    const data = (await response.json()) as Materia[];
    setMaterie(data.sort((a, b) => a.nome.localeCompare(b.nome)));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMaterie().catch((e) => setError(e.message));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="p-8 max-w-6xl mx-auto w-full h-full space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Gestione Materie</h1>
        <p className="text-gray-500 mt-2">Amministra elenco materie e descrizioni.</p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-4 grid gap-3 md:grid-cols-[1fr_2fr_auto] items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
          <input value={descrizione} onChange={(e) => setDescrizione(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5" />
        </div>
        <button
          onClick={() => {
            void (async () => {
              setError(null);
              const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/materie`, {
                method: "POST",
                body: JSON.stringify({ nome: nome.trim(), descrizione: descrizione.trim() }),
              });
              if (!response.ok) throw new Error(`Creazione fallita: ${response.status}`);
              setNome("");
              setDescrizione("");
              await loadMaterie();
            })().catch((e) => setError(e.message));
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg"
        >
          Aggiungi
        </button>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Descrizione</th>
              <th className="text-left px-4 py-3">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {materie.map((materia) => (
              <tr key={materia.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  {editingId === materia.id ? (
                    <input value={editNome} onChange={(e) => setEditNome(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
                  ) : (
                    materia.nome
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === materia.id ? (
                    <input value={editDescrizione} onChange={(e) => setEditDescrizione(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
                  ) : (
                    materia.descrizione
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {editingId === materia.id ? (
                      <>
                        <button
                          onClick={() => {
                            void (async () => {
                              setError(null);
                              const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/materie/${materia.id}`, {
                                method: "PUT",
                                body: JSON.stringify({ nome: editNome.trim(), descrizione: editDescrizione.trim() }),
                              });
                              if (!response.ok) throw new Error(`Aggiornamento fallito: ${response.status}`);
                              setEditingId(null);
                              await loadMaterie();
                            })().catch((e) => setError(e.message));
                          }}
                          className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Salva
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50">Annulla</button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(materia.id);
                          setEditNome(materia.nome);
                          setEditDescrizione(materia.descrizione);
                        }}
                        className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                      >
                        Modifica
                      </button>
                    )}

                    <button
                      onClick={() => {
                        void (async () => {
                          setError(null);
                          const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/materie/${materia.id}`, { method: "DELETE" });
                          if (!response.ok) {
                            const text = await response.text();
                            throw new Error(text || `Eliminazione fallita: ${response.status}`);
                          }
                          await loadMaterie();
                        })().catch((e) => setError(e.message));
                      }}
                      className="px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Elimina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {materie.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-gray-500">Nessuna materia disponibile.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
