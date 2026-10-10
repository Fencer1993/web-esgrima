import "server-only";
import data from "./data/resultados.json";
import { publicImageSize } from "@/lib/imageSize";
import { slugify } from "./athletes";

// Editable desde el panel (/admin): src/content/data/resultados.json.
export const levels = ["Local", "Provincial", "Autonómico", "Nacional", "Internacional"] as const;
export type Level = (typeof levels)[number];
export type Medal = "oro" | "plata" | "bronce";

export type TournamentResult = {
  athlete: string;
  position: number | null;
  medal: Medal | null;
};

export type Tournament = {
  slug: string;
  name: string;
  date: string; // YYYY-MM-DD
  city: string;
  level: Level;
  weapon: string;
  category: string;
  link?: string;
  photo?: { src: string; width: number; height: number };
  summary?: string;
  results: TournamentResult[];
  season: string; // "2025-26"
};

type RawResult = { athlete?: string; position?: number | string; medal?: string };
type RawTournament = {
  slug?: string;
  name?: string;
  date?: string;
  city?: string;
  level?: string;
  weapon?: string;
  category?: string;
  link?: string;
  photo?: string;
  summary?: string;
  results?: RawResult[];
};

export const medalLabel: Record<Medal, string> = {
  oro: "Oro",
  plata: "Plata",
  bronce: "Bronce",
};

function medalFor(raw: RawResult, position: number | null): Medal | null {
  if (raw.medal === "oro" || raw.medal === "plata" || raw.medal === "bronce") return raw.medal;
  if (position === 1) return "oro";
  if (position === 2) return "plata";
  if (position === 3) return "bronce"; // en esgrima hay dos bronces
  return null;
}

// Temporada deportiva: de septiembre a agosto.
export function seasonOf(date: string): string {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7));
  const start = m >= 9 ? y : y - 1;
  return `${start}-${String(start + 1).slice(2)}`;
}

export const allTournaments: Tournament[] = (data.tournaments as RawTournament[])
  .filter((t) => t.slug?.trim() && t.name?.trim() && t.date)
  .map((t) => {
    const date = t.date!.slice(0, 10);
    const results = (t.results ?? [])
      .filter((r) => r.athlete?.trim())
      .map((r) => {
        const p = Number(r.position);
        const position = Number.isFinite(p) && p > 0 ? p : null;
        return { athlete: r.athlete!.trim(), position, medal: medalFor(r, position) };
      })
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
    return {
      slug: t.slug!.trim(),
      name: t.name!.trim(),
      date,
      city: t.city?.trim() ?? "",
      level: (levels as readonly string[]).includes(t.level ?? "") ? (t.level as Level) : "Local",
      weapon: t.weapon?.trim() || "Sable",
      category: t.category?.trim() ?? "",
      link: t.link?.trim() || undefined,
      photo: t.photo ? { src: t.photo, ...publicImageSize(t.photo) } : undefined,
      summary: t.summary?.trim() || undefined,
      results,
      season: seasonOf(date),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

export function tournamentBySlug(slug: string): Tournament | undefined {
  return allTournaments.find((t) => t.slug === slug);
}

export type MedalCount = Record<Medal, number>;

export function countMedals(results: { medal: Medal | null }[]): MedalCount {
  const c: MedalCount = { oro: 0, plata: 0, bronce: 0 };
  for (const r of results) if (r.medal) c[r.medal]++;
  return c;
}

export const totalMedals: MedalCount = countMedals(allTournaments.flatMap((t) => t.results));

export type AthleteEntry = { tournament: Tournament; result: TournamentResult };

/** Resultados de un deportista (se emparejan por nombre, sin tildes ni mayúsculas). */
export function resultsForAthlete(name: string): AthleteEntry[] {
  const key = slugify(name);
  return allTournaments.flatMap((tournament) =>
    tournament.results
      .filter((r) => slugify(r.athlete) === key)
      .map((result) => ({ tournament, result })),
  );
}

/** Últimas medallas (las más recientes primero). */
export function latestMedals(n: number): AthleteEntry[] {
  return allTournaments
    .flatMap((tournament) =>
      tournament.results.filter((r) => r.medal).map((result) => ({ tournament, result })),
    )
    .slice(0, n);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
