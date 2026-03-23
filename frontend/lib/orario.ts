export const SCHOOL_DAYS = ["LUNEDI", "MARTEDI", "MERCOLEDI", "GIOVEDI", "VENERDI"] as const;

export type SchoolDay = (typeof SCHOOL_DAYS)[number];

export type NormalizedOrarioEntry = {
  classId: number | null;
  className: string;
  day: SchoolDay | null;
  hour: number | null;
  subject: string;
  classroom: string | null;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return null;
}

function readString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeDay(value: unknown): SchoolDay | null {
  const raw = readString(value)?.toUpperCase();
  if (!raw) {
    return null;
  }

  const map: Record<string, SchoolDay> = {
    LUNEDI: "LUNEDI",
    LUNEDI_: "LUNEDI",
    MONDAY: "LUNEDI",
    MARTEDI: "MARTEDI",
    MARTEDI_: "MARTEDI",
    TUESDAY: "MARTEDI",
    MERCOLEDI: "MERCOLEDI",
    WEDNESDAY: "MERCOLEDI",
    GIOVEDI: "GIOVEDI",
    THURSDAY: "GIOVEDI",
    VENERDI: "VENERDI",
    FRIDAY: "VENERDI",
  };

  return map[raw] ?? null;
}

function getClassName(value: unknown): string {
  const asText = readString(value);
  if (asText) {
    return asText;
  }

  const record = toRecord(value);
  if (!record) {
    return "Classe sconosciuta";
  }

  const anno = readString(record.anno);
  const sezione = readString(record.sezione);

  if (anno || sezione) {
    return `${anno ?? ""}${sezione ?? ""}`.trim();
  }

  return "Classe sconosciuta";
}

function getClassId(item: Record<string, unknown>): number | null {
  const direct = readNumber(item.classeId) ?? readNumber(item.idClasse);
  if (direct !== null) {
    return direct;
  }

  const classe = toRecord(item.classe);
  if (!classe) {
    return null;
  }

  return readNumber(classe.id);
}

function getSubject(value: unknown): string {
  const text = readString(value);
  if (text) {
    return text;
  }

  const record = toRecord(value);
  if (!record) {
    return "-";
  }

  return readString(record.nome) ?? readString(record.name) ?? "-";
}

function getClassroom(value: unknown): string | null {
  const text = readString(value);
  if (text) {
    return text;
  }

  const record = toRecord(value);
  if (!record) {
    return null;
  }

  return readString(record.numero) ?? readString(record.name) ?? null;
}

export function normalizeOrarioEntry(raw: unknown): NormalizedOrarioEntry {
  const item = toRecord(raw) ?? {};

  return {
    classId: getClassId(item),
    className: getClassName(item.classe),
    day: normalizeDay(item.giorno ?? item.day),
    hour: readNumber(item.numeroOra ?? item.ora ?? item.hour),
    subject: getSubject(item.materia ?? item.subject),
    classroom: getClassroom(item.aula ?? item.classroom),
  };
}
