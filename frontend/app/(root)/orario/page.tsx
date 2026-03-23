"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBaseUrl } from "@/lib/api-url";
import {
	normalizeOrarioEntry,
	SCHOOL_DAYS,
	type NormalizedOrarioEntry,
	type SchoolDay,
} from "@/lib/orario";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

type TimetableGroup = {
	key: string;
	classId: number | null;
	className: string;
	entries: NormalizedOrarioEntry[];
};

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

export default function OrarioPage() {
	const router = useRouter();

	const [rawEntries, setRawEntries] = useState<NormalizedOrarioEntry[]>([]);
	const [searchText, setSearchText] = useState("");
	const [selectedClassId, setSelectedClassId] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchOrario = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch(`${getBaseUrl()}/orario`, {
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

				setRawEntries(data.map(normalizeOrarioEntry));
			} catch (e) {
				const message = e instanceof Error ? e.message : "Errore sconosciuto";
				setError(message);
			} finally {
				setLoading(false);
			}
		};

		void fetchOrario();
	}, []);

	const groups = useMemo<TimetableGroup[]>(() => {
		const map = new Map<string, TimetableGroup>();

		for (const entry of rawEntries) {
			const key = entry.classId !== null ? String(entry.classId) : entry.className;

			if (!map.has(key)) {
				map.set(key, {
					key,
					classId: entry.classId,
					className: entry.className,
					entries: [],
				});
			}

			map.get(key)?.entries.push(entry);
		}

		return Array.from(map.values()).sort((a, b) => a.className.localeCompare(b.className));
	}, [rawEntries]);

	const searchableGroups = useMemo(() => {
		const needle = searchText.trim().toLowerCase();
		if (!needle) {
			return groups;
		}

		return groups.filter((group) => group.className.toLowerCase().includes(needle));
	}, [groups, searchText]);

	const handleSearchRedirect = () => {
		const target = groups.find(
			(group) => group.className.toLowerCase() === searchText.trim().toLowerCase(),
		);

		if (target && target.classId !== null) {
			router.push(`/orario/${target.classId}`);
		}
	};

	return (
		<section className="mx-4 my-6 space-y-4">
			<header className="space-y-1">
				<h1 className="text-2xl font-bold text-slate-900">Orari classi</h1>
				<p className="text-sm text-slate-600">
					Tabella con 8 ore per giorno, da lunedi a venerdi. Cerca una classe o apri il dettaglio.
				</p>
			</header>

			<div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[2fr_1fr_auto]">
				<div className="space-y-2">
					<label className="text-sm font-medium text-slate-700" htmlFor="class-search">
						Cerca classe
					</label>
					<Input
						id="class-search"
						list="class-options"
						placeholder="Es. 2A"
						value={searchText}
						onChange={(event) => setSearchText(event.target.value)}
					/>
					<datalist id="class-options">
						{groups.map((group) => (
							<option key={group.key} value={group.className} />
						))}
					</datalist>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium text-slate-700" htmlFor="class-select">
						Menu a tendina classi
					</label>
					<select
						id="class-select"
						className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
						value={selectedClassId}
						onChange={(event) => {
							const value = event.target.value;
							setSelectedClassId(value);
							if (value) {
								router.push(`/orario/${value}`);
							}
						}}
					>
						<option value="">Seleziona...</option>
						{groups
							.filter((group) => group.classId !== null)
							.map((group) => (
								<option key={group.key} value={String(group.classId)}>
									{group.className}
								</option>
							))}
					</select>
				</div>

				<div className="flex items-end">
					<Button className="w-full md:w-auto" onClick={handleSearchRedirect}>
						Vai al dettaglio
					</Button>
				</div>
			</div>

			{loading && <p className="text-sm text-slate-600">Caricamento orari in corso...</p>}

			{error && (
				<p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					Impossibile caricare i dati: {error}
				</p>
			)}

			{!loading && !error && (
				<div className="max-h-[68vh] space-y-4 overflow-y-auto pr-1">
					{searchableGroups.map((group) => (
						<article
							key={group.key}
							className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
						>
							<div className="mb-3 flex items-center justify-between gap-3">
								<h2 className="text-lg font-semibold text-slate-900">Classe {group.className}</h2>

								{group.classId !== null ? (
									<Button asChild size="sm" variant="outline">
										<Link href={`/orario/${group.classId}`} target="_blank" rel="noreferrer">
											Apri dettaglio
										</Link>
									</Button>
								) : (
									<Button size="sm" variant="outline" disabled>
										Dettaglio non disponibile
									</Button>
								)}
							</div>

							<div className="overflow-x-auto">
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
											<tr key={`${group.key}-${hour}`}>
												<td className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-800">
													{hour}
												</td>
												{SCHOOL_DAYS.map((day) => {
													const cell = getCell(group.entries, day, hour);

													return (
														<td key={`${group.key}-${day}-${hour}`} className="border border-slate-200 px-3 py-2">
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
						</article>
					))}

					{searchableGroups.length === 0 && (
						<p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
							Nessuna classe trovata con questo criterio.
						</p>
					)}
				</div>
			)}
		</section>
	);
}
