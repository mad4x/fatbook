"use client";

import { useEffect, useState } from "react";

import { getBaseUrl } from "@/lib/api-url";
import { isVicepreside } from "@/lib/jwt";
import {
  normalizeOrarioEntry,
  SCHOOL_DAYS,
  type NormalizedOrarioEntry,
  type SchoolDay,
} from "@/lib/orario";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const token = window.localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getCells(
  entries: NormalizedOrarioEntry[],
  day: SchoolDay,
  hour: number,
): NormalizedOrarioEntry[] {
  return entries.filter((entry) => entry.day === day && entry.hour === hour);
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<NormalizedOrarioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVice, setIsVice] = useState(false);

  const classiCount = new Set(entries.map((entry) => entry.className)).size;
  const auleCount = new Set(entries.map((entry) => entry.classroom).filter(Boolean)).size;
  const oreTotali = entries.length;

  useEffect(() => {
    setIsVice(isVicepreside());

    if (isVicepreside()) {
      setLoading(false);
      return;
    }

    const fetchWeeklyOrario = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${getBaseUrl()}/orario/weekly`, {
          cache: "no-store",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Errore API: ${response.status}`);
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Formato risposta non valido");
        }

        setEntries(data.map(normalizeOrarioEntry));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Errore sconosciuto";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchWeeklyOrario();
  }, []);

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

      {!isVice && (
        <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Ore settimanali</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{oreTotali}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Totale slot assegnati.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Classi attive</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{classiCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Classi coinvolte.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Aule usate</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{auleCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Laboratori e aule standard.</p>
        </div>
      </div>
      )}

      {!isVice && loading && (
        <p className="text-sm text-slate-600 dark:text-slate-400">Caricamento orario in corso...</p>
      )}

      {!isVice && error && (
        <p className="rounded-md border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-200">
          Impossibile caricare l&apos;orario: {error}
        </p>
      )}

      {!isVice && !loading && !error && (
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
                                key={`${cell.className}-${cell.subject}-${index}`}
                                className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1"
                              >
                                <p className="font-medium text-slate-900 dark:text-slate-100">{cell.subject}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Classe {cell.className}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">Aula {cell.classroom || '-'}</p>
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
    </section>
  );
}
