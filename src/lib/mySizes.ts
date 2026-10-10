import type { Kind, SavedSizes } from "./sizeCalc";

// «Mis tallas» de la calculadora, guardadas solo en este navegador
// (localStorage, clave cet-mis-tallas). Todo acceso va en try/catch: sin
// almacenamiento la calculadora funciona igual, solo que sin guardar.

const KEY = "cet-mis-tallas";
const listeners = new Set<() => void>();
let cache: SavedSizes | null = null;
let loaded = false;

function read(): SavedSizes | null {
  try {
    const d = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as SavedSizes | null;
    return d && d.v === 1 && d.brands && typeof d.brands === "object" ? d : null;
  } catch {
    return null;
  }
}

export function getMySizes(): SavedSizes | null {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    cache = read();
  }
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

export function saveMySizes(sizes: SavedSizes): boolean {
  cache = sizes;
  loaded = true;
  emit();
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sizes));
    return true;
  } catch {
    return false;
  }
}

export function clearMySizes() {
  cache = null;
  loaded = true;
  emit();
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* sin almacenamiento: nada que borrar */
  }
}

export function subscribeMySizes(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) {
      loaded = false;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const getMySizesServer = (): SavedSizes | null => null;

/** Categoría de la tienda → tipo de prenda de la calculadora. */
const KIND_BY_CATEGORY: Record<string, Kind> = {
  Trajes: "suit",
  "Chaquetas eléctricas": "jacket",
  Caretas: "mask",
  "Guantes y manguitos": "glove",
  "Calzado y medias": "shoe",
};

/**
 * Talla de la lista `sizes` de un producto que coincide con las tallas
 * guardadas, o "" si no hay. Solo fichas con tabla de una marca (`#tallas-<id>`).
 */
export function savedSizeFor(
  product: { category: string; name: string; sizes: string[]; sizeGuide: string },
  saved: SavedSizes | null,
): string {
  if (!saved) return "";
  const brand = product.sizeGuide.startsWith("#tallas-") ? product.sizeGuide.slice(8) : "";
  if (!brand) return "";
  const kind = /\bpeto\b/i.test(product.name) ? "vest" : KIND_BY_CATEGORY[product.category];
  if (!kind) return "";
  const wanted = kind === "shoe" ? saved.shoe : saved.brands[brand]?.[kind];
  if (!wanted) return "";
  const norm = (s: string) => s.trim().toLowerCase();
  const set = new Set(wanted.map(norm));
  return product.sizes.find((s) => set.has(norm(s))) ?? "";
}
