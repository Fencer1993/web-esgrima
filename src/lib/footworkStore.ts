// Sesiones recientes del entrenador de pies, guardadas solo en este navegador
// (localStorage, clave cet-entrenador-recientes; cada una es el texto de `#s=`).
// Todo acceso va en try/catch: sin almacenamiento el entrenador funciona igual.

export type RecentSession = { name: string; code: string };

const KEY = "cet-entrenador-recientes";
const MAX = 5;
const EMPTY: RecentSession[] = [];
const listeners = new Set<() => void>();
let cache: RecentSession[] = EMPTY;
let loaded = false;

function read(): RecentSession[] {
  try {
    const d = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as unknown;
    if (!Array.isArray(d)) return EMPTY;
    return d
      .filter((x): x is RecentSession => !!x && typeof x.name === "string" && typeof x.code === "string" && x.code.length <= 2000)
      .slice(0, MAX);
  } catch {
    return EMPTY;
  }
}

export function getRecent(): RecentSession[] {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    cache = read();
  }
  return cache;
}

export const serverRecent = (): RecentSession[] => EMPTY;

export function subscribeRecent(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function addRecent(s: RecentSession) {
  cache = [s, ...getRecent().filter((x) => x.code !== s.code)].slice(0, MAX);
  loaded = true;
  listeners.forEach((l) => l());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* sin almacenamiento: solo dura esta visita */
  }
}
