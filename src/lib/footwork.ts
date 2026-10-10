// Lógica del entrenador de pies (sin React, sin navegador): elige la siguiente
// orden al azar según el nivel, con pesos, sin salirse de la pista virtual.
// Todos los movimientos, niveles y tiempos vienen de content/data/entrenador.json.

export type Movement = {
  id: string;
  es: string;
  fr: string;
  en: string;
  niveles: string[];
  /** Efecto en la pista virtual: +1 avanza un paso, -1 retrocede, 0 se queda. */
  paso: number;
  /** Frecuencia relativa (0 = nunca al azar, p. ej. «En guardia»). */
  peso: number;
  /** Color del modo reacción (los movimientos sin color no salen en él). */
  color?: string;
};

export type Level = {
  id: string;
  min: number;
  max: number;
};

export type Rng = () => number;

/**
 * Siguiente orden. Solo entran las del nivel con peso > 0 que no sacan al
 * entrenador de la pista (|posición| ≤ límite). Si ya está en el límite, se
 * fuerza una orden que lo devuelva hacia el centro. Evita repetir la anterior
 * cuando hay otra opción. `onlyColored` es para el modo reacción.
 */
export function pickMove(
  moves: Movement[],
  levelId: string,
  pos: number,
  limit: number,
  rng: Rng,
  prevId?: string,
  onlyColored = false,
): Movement | null {
  const pool = moves.filter((m) => m.peso > 0 && m.niveles.includes(levelId) && (!onlyColored || m.color));
  if (pool.length === 0) return null;
  let cand = Math.abs(pos) >= limit
    ? pool.filter((m) => m.paso * pos < 0)
    : pool.filter((m) => Math.abs(pos + m.paso) <= limit);
  if (cand.length === 0) cand = pool.filter((m) => Math.abs(pos + m.paso) < Math.abs(pos));
  if (cand.length === 0) cand = pool.filter((m) => m.paso === 0);
  if (cand.length === 0) return null;
  if (cand.length > 1 && prevId) cand = cand.filter((m) => m.id !== prevId);
  const total = cand.reduce((n, m) => n + m.peso, 0);
  let r = rng() * total;
  for (const m of cand) {
    r -= m.peso;
    if (r < 0) return m;
  }
  return cand[cand.length - 1];
}

/** Segundos hasta la siguiente orden (al azar entre el mínimo y el máximo del nivel). */
export function nextInterval(level: Level, rng: Rng, minSeconds = 0): number {
  return Math.max(minSeconds, level.min + rng() * (level.max - level.min));
}

/** Simula `n` órdenes seguidas (para pruebas): lista de {id, pos} tras cada una. */
export function simulate(
  moves: Movement[],
  levelId: string,
  limit: number,
  n: number,
  rng: Rng,
  onlyColored = false,
): { id: string; pos: number }[] {
  const out: { id: string; pos: number }[] = [];
  let pos = 0;
  let prev: string | undefined;
  for (let i = 0; i < n; i++) {
    const m = pickMove(moves, levelId, pos, limit, rng, prev, onlyColored);
    if (!m) break;
    pos += m.paso;
    prev = m.id;
    out.push({ id: m.id, pos });
  }
  return out;
}

// --- sesiones para compartir (todo en el enlace, sin servidor) --------------

/** Identificador del «nivel» de una sesión a medida (no existe en entrenador.json). */
export const CUSTOM_LEVEL = "custom";
/** Frecuencia elegida en pantalla → multiplicador del peso del movimiento. */
export const FREQUENCIES = { poca: 0.5, normal: 1, mucha: 2 } as const;
export type Frequency = keyof typeof FREQUENCIES;

/** Límites de lo que se acepta de un enlace (nunca se fía de lo recibido). */
export const SESSION_LIMITS = {
  /** Longitud máxima del texto codificado (tras `#s=`). */
  maxEncoded: 2000,
  maxName: 40,
  duration: [10, 600],
  rounds: [1, 10],
  rest: [0, 300],
  /** Segundos entre órdenes: mínimo y máximo permitidos. */
  paceMin: 0.5,
  paceMax: 15,
  /** Multiplicador de frecuencia. */
  factor: [0.25, 4],
} as const;

export type SessionConfig = {
  name: string;
  lang: "es" | "fr" | "en";
  /** voz con pitidos o modo reacción (colores, sin voz). */
  mode: "voz" | "colores";
  duration: number;
  rounds: number;
  rest: number;
  /** Segundos entre órdenes (mínimo y máximo). */
  min: number;
  max: number;
  moves: { id: string; f: number }[];
};

export type SessionError = "vacio" | "largo" | "formato" | "version" | "movimientos";
export type SessionResult = { ok: true; config: SessionConfig } | { ok: false; error: SessionError };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const num = (x: unknown, fallback: number) => (typeof x === "number" && Number.isFinite(x) ? x : fallback);

/**
 * Valida y normaliza una configuración recibida (enlace, localStorage o JSON
 * del panel): solo movimientos conocidos con peso > 0, números dentro de
 * límites y nombre recortado. Nunca lanza.
 */
export function normalizeSession(raw: unknown, known: Movement[]): SessionResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "formato" };
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.w) || r.w.length === 0 || r.w.length > known.length) return { ok: false, error: "movimientos" };
  const usable = new Map(known.filter((m) => m.peso > 0).map((m) => [m.id, m]));
  const seen = new Set<string>();
  const moves: SessionConfig["moves"] = [];
  for (const item of r.w) {
    if (!Array.isArray(item) || typeof item[0] !== "string" || !usable.has(item[0])) return { ok: false, error: "movimientos" };
    if (seen.has(item[0])) continue;
    seen.add(item[0]);
    moves.push({ id: item[0], f: clamp(num(item[1], 1), SESSION_LIMITS.factor[0], SESSION_LIMITS.factor[1]) });
  }
  const p = Array.isArray(r.p) ? r.p : [];
  const min = clamp(num(p[0], 1.2), SESSION_LIMITS.paceMin, SESSION_LIMITS.paceMax);
  const max = clamp(num(p[1], 2), min, SESSION_LIMITS.paceMax);
  const name = typeof r.n === "string" ? r.n.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, SESSION_LIMITS.maxName) : "";
  return {
    ok: true,
    config: {
      name,
      lang: r.l === "fr" || r.l === "en" ? r.l : "es",
      mode: r.m === "c" ? "colores" : "voz",
      duration: Math.round(clamp(num(r.d, 60), SESSION_LIMITS.duration[0], SESSION_LIMITS.duration[1])),
      rounds: Math.round(clamp(num(r.r, 3), SESSION_LIMITS.rounds[0], SESSION_LIMITS.rounds[1])),
      rest: Math.round(clamp(num(r.t, 30), SESSION_LIMITS.rest[0], SESSION_LIMITS.rest[1])),
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      moves,
    },
  };
}

function toBase64Url(text: string): string {
  let bin = "";
  for (const b of new TextEncoder().encode(text)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string | null {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(code)) return null;
    const bin = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

/** Configuración → texto para `#s=` (JSON versión 1 en base64url). */
export function encodeSession(config: SessionConfig, known: Movement[]): { ok: true; code: string } | { ok: false; error: SessionError } {
  const check = normalizeSession(
    {
      n: config.name, l: config.lang, m: config.mode === "colores" ? "c" : "v", d: config.duration, r: config.rounds,
      t: config.rest, p: [config.min, config.max], w: config.moves.map((m) => [m.id, m.f]),
    },
    known,
  );
  if (!check.ok) return check;
  const c = check.config;
  const json = JSON.stringify({
    v: 1, n: c.name, l: c.lang, m: c.mode === "colores" ? "c" : "v", d: c.duration, r: c.rounds, t: c.rest,
    p: [c.min, c.max], w: c.moves.map((m) => [m.id, m.f]),
  });
  const code = toBase64Url(json);
  return code.length > SESSION_LIMITS.maxEncoded ? { ok: false, error: "largo" } : { ok: true, code };
}

/** Texto de `#s=` → configuración validada, o un error controlado (nunca lanza). */
export function decodeSession(code: string, known: Movement[]): SessionResult {
  if (!code) return { ok: false, error: "vacio" };
  if (code.length > SESSION_LIMITS.maxEncoded) return { ok: false, error: "largo" };
  const text = fromBase64Url(code);
  if (text === null) return { ok: false, error: "formato" };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "formato" };
  }
  if (!raw || typeof raw !== "object") return { ok: false, error: "formato" };
  if ((raw as { v?: unknown }).v !== 1) return { ok: false, error: "version" };
  return normalizeSession(raw, known);
}

/** Movimientos de una sesión a medida: peso = peso base × frecuencia, nivel «custom». */
export function customMoves(config: SessionConfig, known: Movement[]): Movement[] {
  const f = new Map(config.moves.map((m) => [m.id, m.f]));
  return known
    .filter((m) => f.has(m.id))
    .map((m) => ({ ...m, niveles: [CUSTOM_LEVEL], peso: m.peso * (f.get(m.id) ?? 1) }));
}

/** Sesión del club (formato del panel, con «poca/normal/mucha») → configuración validada. */
export function clubSession(
  s: {
    nombre: string; movimientos: { id: string; frecuencia: string }[]; ritmoMin: number; ritmoMax: number;
    duracion: number; rondas: number; descanso: number; idioma: string; modo: string;
  },
  known: Movement[],
): SessionResult {
  return normalizeSession(
    {
      n: s.nombre, l: s.idioma, m: s.modo === "colores" ? "c" : "v", d: s.duracion, r: s.rondas, t: s.descanso,
      p: [s.ritmoMin, s.ritmoMax],
      w: s.movimientos.map((m) => [m.id, FREQUENCIES[m.frecuencia as Frequency] ?? 1]),
    },
    known,
  );
}
