"use client";

import Link from "next/link";
import VicepresideBack from "@/components/ui/vicepreside-back";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getBaseUrl } from "@/lib/api-url";
import { fetchWithAuth } from "@/lib/jwt";
import { SCHOOL_DAYS, type SchoolDay } from "@/lib/orario";

type EditableCell = {
  oraId: number | null;
  classId: number;
  className: string;
  day: SchoolDay | null;
  hour: number;
  materiaId: number;
  materiaName: string;
  aulaId: number | null;
  aulaName: string | null;
  docentiIds: number[];
  docenti: string[];
};

type MateriaOption = { id: number; nome: string };
type AulaOption = { id: number; numero: string; piano: number };
type DocenteOption = { id: number; nome: string; cognome: string; materieIds?: number[] };
type DisponibilitaDocente = { id: number; disponibile: boolean };

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function toCell(raw: unknown): EditableCell | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const dayRaw = typeof item.giorno === "string" ? item.giorno : null;
  const allowed = new Set<SchoolDay>(SCHOOL_DAYS);
  const day = dayRaw && allowed.has(dayRaw as SchoolDay) ? (dayRaw as SchoolDay) : null;

  return {
    oraId: item.oraId === null || item.oraId === undefined ? null : Number(item.oraId),
    classId: Number(item.classeId ?? 0),
    className: String(item.classe ?? ""),
    day,
    hour: Number(item.ora ?? 0),
    materiaId: Number(item.materiaId ?? 0),
    materiaName: String(item.materia ?? "-"),
    aulaId: item.aulaId === null || item.aulaId === undefined ? null : Number(item.aulaId),
    aulaName: item.aula === null || item.aula === undefined ? null : String(item.aula),
    docentiIds: Array.isArray(item.docentiIds) ? item.docentiIds.map((v) => Number(v)) : [],
    docenti: Array.isArray(item.docenti) ? item.docenti.map((v) => String(v)) : [],
  };
}

function getCell(entries: EditableCell[], day: SchoolDay, hour: number): EditableCell | null {
  return entries.find((entry) => entry.day === day && entry.hour === hour) ?? null;
}

export default function ClasseOrarioEditorPage() {
  const params = useParams<{ id: string }>();
  const classId = params.id;

  const [entries, setEntries] = useState<EditableCell[]>([]);
  const [materie, setMaterie] = useState<MateriaOption[]>([]);
  const [aule, setAule] = useState<AulaOption[]>([]);
  const [docenti, setDocenti] = useState<DocenteOption[]>([]);

  const [selected, setSelected] = useState<EditableCell | null>(null);
  const [selectedMateriaId, setSelectedMateriaId] = useState<number>(0);
  const [selectedAulaId, setSelectedAulaId] = useState<string>("");
  const [selectedDocentiIds, setSelectedDocentiIds] = useState<number[]>([]);
  const [disponibilita, setDisponibilita] = useState<Record<number, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDisponibilita, setLoadingDisponibilita] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [orarioRes, materieRes, auleRes, docentiRes] = await Promise.all([
        fetchWithAuth(`${getBaseUrl()}/vicepresidenza/classi/${classId}/orario`),
        fetchWithAuth(`${getBaseUrl()}/vicepresidenza/materie`),
        fetchWithAuth(`${getBaseUrl()}/vicepresidenza/aule`),
        fetchWithAuth(`${getBaseUrl()}/docenti`),
      ]);

      if (!orarioRes.ok) throw new Error(`Errore orario: ${orarioRes.status}`);
      if (!materieRes.ok) throw new Error(`Errore materie: ${materieRes.status}`);
      if (!auleRes.ok) throw new Error(`Errore aule: ${auleRes.status}`);
      if (!docentiRes.ok) throw new Error(`Errore docenti: ${docentiRes.status}`);

      const orarioData = (await orarioRes.json()) as unknown[];
      const materieData = (await materieRes.json()) as MateriaOption[];
      const auleData = (await auleRes.json()) as AulaOption[];
      const docentiData = (await docentiRes.json()) as DocenteOption[];

      setEntries(orarioData.map(toCell).filter((v): v is EditableCell => v !== null));
      setMaterie(materieData);
      setAule(auleData);
      setDocenti(docentiData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (classId) {
      void loadAll();
    }
  }, [classId, loadAll]);

  const className = useMemo(() => {
    if (entries.length === 0) {
      return classId;
    }
    return entries[0].className;
  }, [entries, classId]);

  const openEditor = (cell: EditableCell) => {
    setSelected(cell);
    if (cell.materiaId > 0) {
      setSelectedMateriaId(cell.materiaId);
    } else {
      setSelectedMateriaId(materie[0]?.id ?? 0);
    }
    setSelectedAulaId(cell.aulaId !== null ? String(cell.aulaId) : "");
    setSelectedDocentiIds(cell.docentiIds);
  };

  const refreshDisponibilita = useCallback(async () => {
    if (!selected?.day || !selected?.hour) {
      setDisponibilita({});
      return;
    }

    setLoadingDisponibilita(true);
    try {
      const response = await fetchWithAuth(
        `${getBaseUrl()}/vicepresidenza/docenti/disponibilita?giorno=${encodeURIComponent(selected.day)}&ora=${selected.hour}&classeId=${classId}`,
      );
      if (!response.ok) {
        throw new Error(`Errore disponibilita docenti: ${response.status}`);
      }
      const data = (await response.json()) as DisponibilitaDocente[];
      const map: Record<number, boolean> = {};
      data.forEach((item) => {
        map[item.id] = item.disponibile;
      });
      setDisponibilita(map);
    } catch (e) {
      console.error("Errore disponibilita docenti", e);
    } finally {
      setLoadingDisponibilita(false);
    }
  }, [classId, selected]);

  const toggleDocente = (docenteId: number) => {
    setSelectedDocentiIds((prev) =>
      prev.includes(docenteId) ? prev.filter((id) => id !== docenteId) : [...prev, docenteId],
    );
  };

  const saveSelected = async () => {
    if (!selected) {
      return;
    }

    if (!selected.day) {
      setError("Giorno non valido per questa cella");
      return;
    }

    if (!selectedMateriaId) {
      setError("Seleziona una materia prima di salvare");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = selected.oraId
        ? await fetchWithAuth(
            `${getBaseUrl()}/vicepresidenza/classi/${classId}/orario/${selected.oraId}`,
            {
              method: "PUT",
              body: JSON.stringify({
                materiaId: selectedMateriaId,
                aulaId: selectedAulaId ? Number(selectedAulaId) : null,
                docentiIds: selectedDocentiIds,
              }),
            },
          )
        : await fetchWithAuth(`${getBaseUrl()}/vicepresidenza/classi/${classId}/orario`, {
            method: "PUT",
            body: JSON.stringify({
              giorno: selected.day,
              ora: selected.hour,
              materiaId: selectedMateriaId,
              aulaId: selectedAulaId ? Number(selectedAulaId) : null,
              docentiIds: selectedDocentiIds,
            }),
          });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Salvataggio fallito: ${response.status}`);
      }

      const updatedRaw = await response.json();
      const updated = toCell(updatedRaw);
      if (updated) {
        setEntries((prev) => {
          const index = prev.findIndex((item) => item.day === updated.day && item.hour === updated.hour);
          if (index === -1) {
            return [...prev, updated];
          }

          const clone = [...prev];
          clone[index] = updated;
          return clone;
        });
      }

      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    void refreshDisponibilita();
  }, [refreshDisponibilita]);

  useEffect(() => {
    if (!selected) return;
    setSelectedDocentiIds((prev) =>
      prev.filter((docenteId) => {
        const docente = docenti.find((item) => item.id === docenteId);
        if (!docente) return false;
        const abilitato = selectedMateriaId ? (docente.materieIds ?? []).includes(selectedMateriaId) : true;
        const disponibile = disponibilita[docenteId] ?? true;
        return abilitato && disponibile;
      }),
    );
  }, [selected, selectedMateriaId, disponibilita, docenti]);

  return (
    <section className="mx-4 my-6 space-y-4">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Modifica orario classe {className}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Clicca una cella per cambiare materia, aula e docenti.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VicepresideBack />
          <Link
            href="/vicepresidenza/classi"
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Torna alle classi
          </Link>
        </div>
      </header>

      {loading && <p className="text-sm text-slate-600 dark:text-slate-300">Caricamento in corso...</p>}
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  <th className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-left">Ora</th>
                  {SCHOOL_DAYS.map((day) => (
                    <th key={day} className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-left">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour}>
                    <td className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">{hour}</td>
                    {SCHOOL_DAYS.map((day) => {
                      const cell = getCell(entries, day, hour);
                      const display =
                        cell ??
                        ({
                          oraId: null,
                          classId: Number(classId),
                          className,
                          day,
                          hour,
                          materiaId: 0,
                          materiaName: "-",
                          aulaId: null,
                          aulaName: null,
                          docentiIds: [],
                          docenti: [],
                        } as EditableCell);

                      return (
                        <td key={`${day}-${hour}`} className="border border-slate-200 dark:border-slate-700 px-2 py-2 align-top">
                          <button
                            onClick={() => openEditor(display)}
                            className="w-full text-left rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-2 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800"
                          >
                            <p className="font-medium text-slate-900 dark:text-slate-100">{display.materiaName}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Aula {display.aulaName ?? "-"}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Docenti: {display.docenti.length > 0 ? display.docenti.join(", ") : "nessuno"}</p>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-4 h-fit">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Editor cella</h2>
            {!selected && <p className="text-sm text-slate-600 dark:text-slate-300">Seleziona una cella dalla tabella.</p>}

            {selected && (
              <>
                <p className="text-sm text-slate-700 dark:text-slate-200">{selected.day} - ora {selected.hour}</p>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Materia</label>
                  <select
                    className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2"
                    value={selectedMateriaId}
                    onChange={(e) => setSelectedMateriaId(Number(e.target.value))}
                  >
                    {materie.map((materia) => (
                      <option key={materia.id} value={materia.id}>
                        {materia.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Aula</label>
                  <select
                    className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2"
                    value={selectedAulaId}
                    onChange={(e) => setSelectedAulaId(e.target.value)}
                  >
                    <option value="">Nessuna aula</option>
                    {aule.map((aula) => (
                      <option key={aula.id} value={String(aula.id)}>
                        Piano {aula.piano} - Aula {aula.numero}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Docenti assegnati</p>
                  {loadingDisponibilita && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Verifica disponibilita in corso...</p>
                  )}
                  <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 p-2 space-y-1">
                    {docenti.map((docente) => (
                      <label key={docente.id} className="flex items-center justify-between gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDocentiIds.includes(docente.id)}
                            onChange={() => toggleDocente(docente.id)}
                            disabled={
                              !!selectedMateriaId &&
                              (!(docente.materieIds ?? []).includes(selectedMateriaId) || !(disponibilita[docente.id] ?? true))
                            }
                          />
                          {docente.nome} {docente.cognome}
                        </span>
                        <span className="flex items-center gap-1">
                          {selectedMateriaId && !(docente.materieIds ?? []).includes(selectedMateriaId) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Non abilitato</span>
                          )}
                          {selectedMateriaId && (docente.materieIds ?? []).includes(selectedMateriaId) && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                (disponibilita[docente.id] ?? true)
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {(disponibilita[docente.id] ?? true) ? "Disponibile" : "Occupato"}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => void saveSelected()}
                    disabled={saving}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Salvataggio..." : "Salva"}
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Chiudi
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
