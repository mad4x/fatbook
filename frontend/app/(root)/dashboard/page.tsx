"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { getBaseUrl } from "@/lib/api-url";
import { isVicepreside } from "@/lib/jwt";
import { SCHOOL_DAYS, type SchoolDay } from "@/lib/orario";
import type {
  Avviso,
  DashboardSlotDTO,
  DashboardSostituzioneDTO,
  DashboardStatsDTO,
  DashboardWeeklyDTO,
} from "@/constants/types";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const token = window.localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getCells(
  entries: DashboardSlotDTO[],
  day: SchoolDay,
  hour: number,
): DashboardSlotDTO[] {
  return entries.filter((entry) => entry.giorno === day && entry.ora === hour);
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<DashboardSlotDTO[]>([]);
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [avvisi, setAvvisi] = useState<Avviso[]>([]);
  const [sostituzioni, setSostituzioni] = useState<DashboardSostituzioneDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVice, setIsVice] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("en-CA"));

  const classiCount = new Set(entries.map((entry) => entry.classeNome)).size;
  const auleCount = new Set(entries.map((entry) => entry.aula).filter(Boolean)).size;
  const oreTotali = stats?.oreTotali ?? 0;
  const oreAssenza = stats?.oreAssenza ?? 0;
  const orePresenza = stats?.orePresenza ?? 0;
  const percentualeAssenza = stats?.percentualeAssenza ?? 0;

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
  const currentWeekStart = getWeekDays(new Date().toLocaleDateString("en-CA"))[0];
  const isCurrentWeek = weekStart === currentWeekStart;

  useEffect(() => {
    setIsVice(isVicepreside());

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${getBaseUrl()}/dashboard/weekly?date=${selectedDate}`, {
          cache: "no-store",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Errore API: ${response.status}`);
        }

        const data: DashboardWeeklyDTO = await response.json();
        setEntries(data.slots ?? []);
        setStats(data.stats ?? null);
        setSostituzioni(data.sostituzioni ?? []);
      } catch (e) {
        setError("Impossibile caricare la dashboard. Riprova tra poco.");
      } finally {
        setLoading(false);
      }
    };

    const fetchAvvisi = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/avvisi`, {
          cache: "no-store",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          return;
        }

        const data: Avviso[] = await response.json();
        setAvvisi(data.slice(0, 3));
      } catch {
        setAvvisi([]);
      }
    };

    void fetchDashboard();
    void fetchAvvisi();
  }, [selectedDate]);

  return (
    <section className="mx-4 my-6 space-y-6">
      {isVice ? (
        <header className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-900 via-slate-900 to-indigo-900 text-white p-6 shadow-sm">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_55%)]" />
          <div className="relative space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Vicepresidenza</p>
            <h1 className="text-3xl font-semibold">Dashboard Vicepresidenza</h1>
            <p className="text-sm text-emerald-100">Accesso rapido alla supervisione didattica.</p>
          </div>
        </header>
      ) : (
        <header className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-6 shadow-sm">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%)]" />
          <div className="relative space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Docente</p>
            <h1 className="text-3xl font-semibold">Dashboard Orario</h1>
            <p className="text-sm text-slate-200">Vista rapida delle lezioni e dei punti chiave della settimana.</p>
          </div>
        </header>
      )}

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
            {isCurrentWeek && (
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5">
                Settimana corrente
              </span>
            )}
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
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Ore settimanali</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{oreTotali}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Totale slot assegnati.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Ore presenza</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{orePresenza}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lezioni coperte.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Ore assenza</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{oreAssenza}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Slot assenti.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">% assenza</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{percentualeAssenza.toFixed(1)}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rapporto settimanale.</p>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-slate-600 dark:text-slate-400">Caricamento orario in corso...</p>
      )}

      {error && (
        <p className="rounded-md border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-200">
          {error}
        </p>
      )}

      {!loading && !error && !isVice && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sostituzioni assegnate</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Settimana selezionata</span>
          </div>
          {sostituzioni.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nessuna sostituzione in programma.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {sostituzioni.map((item, index) => (
                <div
                  key={`sostituzione-${item.data}-${item.ora}-${index}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">{item.giorno}</span>
                    <span>{item.data}</span>
                    <span className="text-slate-400">|</span>
                    <span>{item.ora}ª ora</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Classe {item.classeNome} · {item.materia ?? "Materia non disponibile"} · Aula {item.aula || "-"}
                  </div>
                  <div className="text-xs text-rose-600 dark:text-rose-300">
                    Assente: {item.docenteAssenteNome} {item.docenteAssenteCognome}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                <th className="border border-slate-200 dark:border-slate-800 px-3 py-2 text-left">Ora</th>
                {SCHOOL_DAYS.map((day) => (
                  <th key={day} className="border border-slate-200 dark:border-slate-800 px-3 py-2 text-left">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {HOURS.map((hour) => (
                <tr key={`dashboard-${hour}`}>
                  <td className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">
                    {hour}ª
                  </td>

                  {SCHOOL_DAYS.map((day) => {
                    const cells = getCells(entries, day, hour);

                    return (
                      <td key={`dashboard-${day}-${hour}`} className="border border-slate-200 dark:border-slate-800 px-3 py-2 align-top">
                        {cells.length === 0 ? (
                          <p className="font-medium text-slate-400 dark:text-slate-600">-</p>
                        ) : (
                          <div className="space-y-2">
                            {cells.map((cell, index) => (
                              <div
                                key={`${cell.classeNome}-${cell.materia}-${index}`}
                                className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1"
                              >
                                <p className="font-medium text-slate-900 dark:text-slate-100">{cell.materia}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Classe {cell.classeNome}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">Aula {cell.aula || '-'}</p>
                                {cell.docenteAssenteNome && (
                                  <p className="text-xs text-rose-600 dark:text-rose-300">
                                    Assente: {cell.docenteAssenteNome} {cell.docenteAssenteCognome}
                                  </p>
                                )}
                                {(cell.docenteSostitutoNome || cell.supplenteNome) && (
                                  <p className="text-xs text-emerald-600 dark:text-emerald-300">
                                    Sostituto: {cell.docenteSostitutoNome ? `${cell.docenteSostitutoNome} ${cell.docenteSostitutoCognome}` : cell.supplenteNome}
                                  </p>
                                )}
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

      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ultimi avvisi</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Le ultime comunicazioni pubblicate.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {avvisi.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nessun avviso disponibile.</p>
            ) : (
              avvisi.map((avviso) => (
                <div key={`avviso-${avviso.id}`} className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{avviso.titolo}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(avviso.dataCreazione).toLocaleDateString("it-IT")} · {avviso.priorita}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
