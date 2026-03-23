"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { getBaseUrl } from "@/lib/api-url";
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

function getCell(
  entries: NormalizedOrarioEntry[],
  day: SchoolDay,
  hour: number,
): NormalizedOrarioEntry | null {
  return entries.find((entry) => entry.day === day && entry.hour === hour) ?? null;
}

export default function OrarioDetailPage() {
  const params = useParams<{ id: string }>();
  const classId = params.id;

  const [entries, setEntries] = useState<NormalizedOrarioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${getBaseUrl()}/orario/${classId}`, {
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

    if (classId) {
      void fetchDetail();
    }
  }, [classId]);

  const className = useMemo(() => {
    if (entries.length === 0) {
      return classId;
    }

    return entries[0].className;
  }, [entries, classId]);

  return (
    <section className="mx-4 my-6 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dettaglio orario classe {className}</h1>
          <p className="text-sm text-slate-600">Vista completa da lunedi a venerdi con 8 ore.</p>
        </div>

        <Button asChild variant="outline">
          <Link href="/orario">Torna alla lista</Link>
        </Button>
      </header>

      {loading && <p className="text-sm text-slate-600">Caricamento dettaglio in corso...</p>}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Impossibile caricare il dettaglio: {error}
        </p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-200 px-3 py-2 text-left">Ora</th>
                {SCHOOL_DAYS.map((day) => (
                  <th key={day} className="border border-slate-200 px-3 py-2 text-left">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {HOURS.map((hour) => (
                <tr key={`detail-${hour}`}>
                  <td className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-800">
                    {hour}
                  </td>
                  {SCHOOL_DAYS.map((day) => {
                    const cell = getCell(entries, day, hour);

                    return (
                      <td key={`detail-${day}-${hour}`} className="border border-slate-200 px-3 py-2">
                        <p className="font-medium text-slate-900">{cell?.subject ?? "-"}</p>
                        {cell?.classroom && (
                          <p className="text-xs text-slate-500">Aula {cell.classroom}</p>
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
