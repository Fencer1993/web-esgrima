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
