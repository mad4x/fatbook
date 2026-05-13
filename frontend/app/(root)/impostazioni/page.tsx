"use client";

import { useEffect, useMemo, useState } from "react";
import { getRolesFromToken, hasVicepresidenzaRole } from "@/lib/jwt";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "fatbook-settings";

type SettingsState = {
  theme: ThemeMode;
  compactTables: boolean;
  reduceMotion: boolean;
  confirmCritical: boolean;
  weeklyDigest: boolean;
  smartHints: boolean;
  reminderOrario: boolean;
  laboratorioDefault: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  theme: "system",
  compactTables: false,
  reduceMotion: false,
  confirmCritical: true,
  weeklyDigest: true,
  smartHints: true,
  reminderOrario: true,
  laboratorioDefault: false,
};

const ImpostazioniPage = () => {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const isVicepreside = hasVicepresidenzaRole(userRoles);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setHydrated(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      setSettings((prev) => ({ ...prev, ...parsed }));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    setUserRoles(getRolesFromToken());
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      if (mode === "system") {
        document.documentElement.classList.toggle(
          "dark",
          window.matchMedia("(prefers-color-scheme: dark)").matches,
        );
        return;
      }
      document.documentElement.classList.toggle("dark", mode === "dark");
    };

    applyTheme(settings.theme);

    if (settings.theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    if ("addEventListener" in media) {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.dataset.layout = settings.compactTables ? "compact" : "comfortable";
  }, [settings.compactTables]);

  useEffect(() => {
    document.documentElement.dataset.motion = settings.reduceMotion ? "reduce" : "full";
  }, [settings.reduceMotion]);

  const themeDescription = useMemo(() => {
    if (settings.theme === "system") return "Segue il tema del dispositivo";
    return settings.theme === "dark" ? "Contrasto alto per ambienti scuri" : "Luminoso e pulito";
  }, [settings.theme]);

  const updateSetting = (key: keyof SettingsState, value: SettingsState[keyof SettingsState]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="p-8 max-w-6xl mx-auto w-full h-full space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Impostazioni</h1>
        <p className="text-gray-500 dark:text-slate-400">
          Regola tema, comfort visivo e preferenze operative per vicepreside e docenti.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Tema e UX di base</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Preferenze condivise su tutte le schermate.</p>

          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Modalita tema</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{themeDescription}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["light", "dark", "system"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSetting("theme", mode as ThemeMode)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      settings.theme === mode
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-300"
                    }`}
                  >
                    {mode === "light" ? "Chiaro" : mode === "dark" ? "Scuro" : "Sistema"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Tabelle compatte</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Riduce l&apos;altezza delle righe in orario, assenze e altre tabelle.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.compactTables}
                  onChange={(e) => updateSetting("compactTables", e.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Riduci animazioni</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Utile per dispositivi meno potenti.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reduceMotion}
                  onChange={(e) => updateSetting("reduceMotion", e.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Conferma azioni critiche</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Chiede conferma per modifiche sensibili.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.confirmCritical}
                  onChange={(e) => updateSetting("confirmCritical", e.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Suggerimenti smart</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Mostra hint contestuali e scorciatoie.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smartHints}
                  onChange={(e) => updateSetting("smartHints", e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isVicepreside && (
            <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Impostazioni Vicepreside</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Controlli operativi per la gestione d'istituto.</p>
              <div className="mt-4 space-y-3">
                <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Digest settimanale</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Riepilogo assenze, orari e avvisi.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.weeklyDigest}
                    onChange={(e) => updateSetting("weeklyDigest", e.target.checked)}
                    className="h-4 w-4"
                  />
                </label>
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Priorita dashboard</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Scegli l'area da mostrare appena entri.</p>
                  <select className="mt-3 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 px-3 py-2">
                    <option>Assenze del giorno</option>
                    <option>Avvisi urgenti</option>
                    <option>Orario provvisorio</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {!isVicepreside && (
            <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Impostazioni Docenti</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Preferenze personali per l'operativita quotidiana.</p>
              <div className="mt-4 space-y-3">
                <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Promemoria orario</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Notifica prima delle prime ore.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reminderOrario}
                    onChange={(e) => updateSetting("reminderOrario", e.target.checked)}
                    className="h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Laboratorio di default</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Usa aula laboratorio quando disponibile.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.laboratorioDefault}
                    onChange={(e) => updateSetting("laboratorioDefault", e.target.checked)}
                    className="h-4 w-4"
                  />
                </label>
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Lingua avvisi</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Imposta la lingua delle notifiche.</p>
                  <select className="mt-3 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 px-3 py-2">
                    <option>Italiano</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ImpostazioniPage;
