"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getBaseUrl } from "@/lib/api-url";
import { fetchWithAuth } from "@/lib/jwt";

type Classe = {
  id: number;
  anno: number;
  sezione: string;
};

export default function GestioneClassiPage() {
  const [classi, setClassi] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newAnno, setNewAnno] = useState(1);
  const [newSezione, setNewSezione] = useState("A");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAnno, setEditAnno] = useState(1);
  const [editSezione, setEditSezione] = useState("A");

  const loadClassi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/classi`);
      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }
      const data = (await response.json()) as Classe[];
      setClassi(data.sort((a, b) => `${a.anno}${a.sezione}`.localeCompare(`${b.anno}${b.sezione}`)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClassi();
  }, []);

  const createClasse = async () => {
    setError(null);
    const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/classi`, {
      method: "POST",
      body: JSON.stringify({ anno: newAnno, sezione: newSezione.trim().toUpperCase() }),
    });

    if (!response.ok) {
      throw new Error(`Creazione fallita: ${response.status}`);
    }

    setNewAnno(1);
    setNewSezione("A");
    await loadClassi();
  };

  const updateClasse = async (id: number) => {
    setError(null);
    const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/classi/${id}`, {
      method: "PUT",
      body: JSON.stringify({ anno: editAnno, sezione: editSezione.trim().toUpperCase() }),
    });

    if (!response.ok) {
      throw new Error(`Aggiornamento fallito: ${response.status}`);
    }

    setEditingId(null);
    await loadClassi();
  };

  const deleteClasse = async (id: number) => {
    setError(null);
    const response = await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/classi/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Eliminazione fallita: ${response.status}`);
    }

    await loadClassi();
  };

  return (
    <section className="p-8 max-w-6xl mx-auto w-full h-full space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Gestione Classi</h1>
        <p className="text-gray-500 mt-2">Crea classi e accedi alla modifica dell&apos;orario cella per cella.</p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Anno</label>
          <input
            type="number"
            min={1}
            max={5}
            value={newAnno}
            onChange={(e) => setNewAnno(Number(e.target.value) || 1)}
            className="w-full border border-gray-300 rounded-lg p-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sezione</label>
          <input
            value={newSezione}
            onChange={(e) => setNewSezione(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5"
            placeholder="A"
          />
        </div>
        <button
          onClick={() => void createClasse().catch((e) => setError(e.message))}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg"
        >
          Crea classe
        </button>
      </div>

      {loading && <p className="text-sm text-gray-600">Caricamento classi...</p>}
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      {!loading && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Classe</th>
                <th className="text-left px-4 py-3">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {classi.map((classe) => (
                <tr key={classe.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    {editingId === classe.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={editAnno}
                          onChange={(e) => setEditAnno(Number(e.target.value) || 1)}
                          className="w-20 border border-gray-300 rounded-lg p-2"
                        />
                        <input
                          value={editSezione}
                          onChange={(e) => setEditSezione(e.target.value)}
                          className="w-20 border border-gray-300 rounded-lg p-2"
                        />
                      </div>
                    ) : (
                      <span className="font-medium text-gray-800">{classe.anno}{classe.sezione}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/vicepresidenza/classi/${classe.id}`}
                        className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Apri orario
                      </Link>

                      {editingId === classe.id ? (
                        <>
                          <button
                            onClick={() => void updateClasse(classe.id).catch((e) => setError(e.message))}
                            className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Salva
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            Annulla
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(classe.id);
                            setEditAnno(classe.anno);
                            setEditSezione(classe.sezione);
                          }}
                          className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          Modifica
                        </button>
                      )}

                      <button
                        onClick={() => void deleteClasse(classe.id).catch((e) => setError(e.message))}
                        className="px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                      >
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {classi.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-gray-500">Nessuna classe disponibile.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
