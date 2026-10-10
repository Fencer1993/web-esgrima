import type { SizeBrand, SizeTable } from "@/content/sizes";

// Calculadora de talla de la tienda. Solo lee las tablas de tallas.json (se le
// pasan como parámetro): ninguna talla está escrita aquí, así que si se editan
// las tablas desde el panel, la calculadora cambia sola. Sin dependencias, y
// pensada para que se pueda probar con `node --experimental-strip-types`
// (.github/scripts/test-size-calc.mjs).

export type Profile = "nino" | "mujer" | "hombre";
export type Kind = "suit" | "vest" | "jacket" | "mask" | "glove" | "shoe";
export type Fit = "good" | "approx" | "out";

export type Measures = {
  profile: Profile;
  /** Centímetros. Solo la altura es obligatoria. */
  height: number;
  /** Años (solo niños). */
  age?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  /** Contorno de cabeza (careta) y de mano (guante), en cm. */
  head?: number;
  hand?: number;
  /** Número de pie EU (zapatillas). */
  shoe?: number;
};

export type Item = {
  kind: Kind;
  /** Talla tal como aparece en la tabla (primera columna o «Talla de peto»). */
  label: string;
  fit: Fit;
  /** Título de la tabla de la que sale (para mostrar la variante). */
  table: string;
  /** Hay varias tablas posibles (p. ej. estatura normal/alta/baja): se muestra cuál. */
  variant: boolean;
  /** Talla siguiente si el niño está en el tercio alto del rango. */
  grow?: string;
  /** Datos extra de la fila (guantes: cm; zapatillas: UK, US, JP). */
  extra?: { header: string; value: string }[];
  /** La tabla es de otra marca (la de referencia) porque esta no tiene propia. */
  borrowed: boolean;
};

export type BrandResult = { id: string; items: Item[] };
export type Result = { brands: BrandResult[]; shoe: Item | null };

// ---------------------------------------------------------------------------
// Lectura de las tablas
// ---------------------------------------------------------------------------

type Col = "height" | "chest" | "waist" | "hip" | "head" | "hand" | "age";
type Range = [number, number];

const plain = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

const num = (s: string) => parseFloat(s.replace(",", "."));

/** Interpreta una celda: "84-88", "hasta 58", "más de 62", "72 o más", "162", "15,2", "—". */
export function parseCell(cell: string, tol = 3): Range | null {
  const c = plain(cell);
  const nums = (c.match(/\d+(?:[.,]\d+)?/g) ?? []).map(num);
  if (nums.length === 0) return null;
  if (/^(hasta|menos de)/.test(c)) return [-Infinity, nums[0]];
  if (/^mas de/.test(c) || /o mas$/.test(c)) return [nums[0], Infinity];
  if (nums.length >= 2 && /\d\s*[-–]\s*\d/.test(c)) return [nums[0], nums[1]];
  return [nums[0] - tol, nums[0] + tol];
}

function colOf(header: string): Col | null {
  const h = plain(header);
  if (h.includes("altura")) return "height";
  if (h.includes("pecho")) return "chest";
  if (h.includes("cintura")) return "waist";
  if (h.includes("cadera")) return "hip";
  if (h.includes("cabeza")) return "head";
  if (h.includes("mano") && !h.includes("pulgada")) return "hand";
  if (h.includes("edad")) return "age";
  return null;
}

function kindOf(title: string): Kind | null {
  const t = plain(title);
  if (/^(trajes|ropa)/.test(t)) return "suit";
  if (t.startsWith("chaqueta electrica")) return "jacket";
  if (t.startsWith("caretas")) return "mask";
  if (t.startsWith("guantes")) return "glove";
  if (t.startsWith("peto interior")) return "vest";
  if (t.startsWith("zapatillas")) return "shoe";
  return null;
}

function profileOf(title: string): Profile | null {
  const t = plain(title);
  if (t.includes("hombre")) return "hombre";
  if (t.includes("mujer")) return "mujer";
  if (/(ninos|infantil)/.test(t)) return "nino";
  return null;
}

/** Cada medida y cuánto pesa en la puntuación (la altura es la menos decisiva). */
const WEIGHT: Record<Col, number> = { height: 0.5, chest: 1, waist: 1, hip: 1, head: 1, hand: 1, age: 0.5 };

function given(m: Measures): Partial<Record<Col, number>> {
  return { height: m.height, age: m.age, chest: m.chest, waist: m.waist, hip: m.hip, head: m.head };
}

const dist = (r: Range, x: number) => (x < r[0] ? r[0] - x : x > r[1] ? x - r[1] : 0);

type Pick = { index: number; score: number; worst: number };

/**
 * Mejor fila de una tabla para las medidas dadas. Puntuación: suma de la
 * distancia de cada medida a su rango, ponderada. Con empate (o si la medida
 * cae entre dos tallas) gana la fila mayor, como recomienda la guía.
 */
function bestRow(t: SizeTable, vals: Partial<Record<Col, number>>, tol = 3): Pick | null {
  const cols = t.headers.map(colOf);
  let best: Pick | null = null;
  t.rows.forEach((row, index) => {
    let score = 0;
    let worst = 0;
    let used = 0;
    cols.forEach((c, j) => {
      const x = c ? vals[c] : undefined;
      if (!c || x === undefined || !Number.isFinite(x)) return;
      const r = parseCell(row[j] ?? "", tol);
      if (!r) return;
      used++;
      const d = dist(r, x) * WEIGHT[c];
      score += d;
      worst = Math.max(worst, d);
    });
    if (used === 0) return;
    if (!best || score <= best.score) best = { index, score, worst };
  });
  return best;
}

const fitOf = (worst: number): Fit => (worst === 0 ? "good" : worst <= 4 ? "approx" : "out");

/** Columna con el nombre de talla: «Talla de peto» si existe; si no, la primera. */
function labelCol(t: SizeTable): number {
  const i = t.headers.findIndex((h) => plain(h).startsWith("talla de peto"));
  return i >= 0 ? i : 0;
}

// ---------------------------------------------------------------------------
// Cálculo por marca
// ---------------------------------------------------------------------------

/** Marca de referencia cuyas tablas se usan si otra no tiene las suyas (la de Villalbi). */
const REFERENCE_ID = "ve";

function tablesFor(brand: SizeBrand, ref: SizeBrand | undefined, kind: Kind, profile: Profile) {
  const pick = (b: SizeBrand) =>
    b.tables.filter((t) => kindOf(t.title) === kind && [null, profile].includes(profileOf(t.title)));
  const own = pick(brand);
  if (own.length > 0) return { tables: own, borrowed: false };
  // Una marca sin tablas propias (Grant/PBT) usa las de referencia; los guantes
  // y las zapatillas se miden igual en todas.
  if (ref && ref !== brand && (brand.tables.length === 0 || kind === "glove")) {
    return { tables: pick(ref), borrowed: true };
  }
  return { tables: [], borrowed: false };
}

function measured(
  tables: SizeTable[],
  kind: Kind,
  m: Measures,
  borrowed: boolean,
): { item: Item; table: SizeTable; row: number } | null {
  let best: { table: SizeTable; pick: Pick } | null = null;
  for (const t of tables) {
    const pick = bestRow(t, given(m));
    if (pick && (!best || pick.score < best.pick.score)) best = { table: t, pick };
  }
  if (!best) return null;
  const { table, pick } = best;
  const fit = fitOf(pick.worst);
  const row = table.rows[pick.index];
  const item: Item = {
    kind,
    label: row[labelCol(table)],
    fit,
    table: table.title,
    variant: tables.length > 1,
    borrowed,
  };
  return { item, table, row: pick.index };
}

/** Niño en el tercio alto del rango de altura de su talla: se avisa de la siguiente. */
function growHint(table: SizeTable, rowIndex: number, height: number): string | undefined {
  const j = table.headers.findIndex((h) => colOf(h) === "height");
  const next = table.rows[rowIndex + 1];
  const r = j >= 0 ? parseCell(table.rows[rowIndex][j]) : null;
  if (!r || !next || !Number.isFinite(r[0]) || !Number.isFinite(r[1]) || r[1] <= r[0]) return undefined;
  return (height - r[0]) / (r[1] - r[0]) >= 2 / 3 ? next[labelCol(table)] : undefined;
}

/** Talla de traje en número (para buscar en las tablas de peto por talla de traje). */
const suitNumber = (label: string) => parseFloat(label);

function vestBySuit(tables: SizeTable[], profile: Profile, suit: Item, borrowed: boolean): Item | null {
  const want = profile === "nino" ? "ninos" : profile;
  const n = suitNumber(suit.label);
  if (!Number.isFinite(n)) return null;
  for (const t of tables) {
    const j = t.headers.findIndex((h) => plain(h).startsWith(want));
    if (j < 0) continue;
    let best: { i: number; d: number } | null = null;
    t.rows.forEach((row, i) => {
      const r = parseCell(row[j] ?? "", 0);
      if (!r) return;
      const d = dist(r, n);
      if (!best || d <= best.d) best = { i, d };
    });
    if (best) {
      const b: { i: number; d: number } = best;
      return {
        kind: "vest",
        label: t.rows[b.i][0],
        fit: b.d === 0 ? suit.fit : "out",
        table: t.title,
        variant: false,
        borrowed,
      };
    }
  }
  return null;
}

const inches = (cm: number) => Math.ceil((cm / 2.54) * 2 - 1e-9) / 2;

function glove(tables: SizeTable[], hand: number, borrowed: boolean): Item | null {
  const t = tables[0];
  if (!t) return null;
  const sizes = t.rows.map((r) => num(r[0]));
  const want = inches(hand);
  const first = sizes[0];
  const last = sizes[sizes.length - 1];
  const clamped = Math.min(Math.max(want, first), last);
  const i = sizes.findIndex((s) => s >= clamped);
  if (i < 0) return null;
  const gap = Math.abs(want - clamped);
  const cm = t.headers.findIndex((h) => colOf(h) === "hand");
  return {
    kind: "glove",
    label: t.rows[i][0],
    fit: gap === 0 ? "good" : gap <= 1 ? "approx" : "out",
    table: t.title,
    variant: false,
    extra: cm >= 0 ? [{ header: t.headers[cm], value: t.rows[i][cm] }] : undefined,
    borrowed,
  };
}

/** "36 2/3" → 36,67 ; "40" → 40. */
function euNumber(label: string): number {
  const m = label.trim().match(/^(\d+)(?:\s+(\d+)\/(\d+))?/);
  if (!m) return NaN;
  return Number(m[1]) + (m[2] ? Number(m[2]) / Number(m[3]) : 0);
}

function shoe(brands: SizeBrand[], eu: number): Item | null {
  const tables = brands.flatMap((b) => b.tables).filter((t) => kindOf(t.title) === "shoe");
  let best: { t: SizeTable; i: number; d: number } | null = null;
  for (const t of tables) {
    t.rows.forEach((row, i) => {
      const d = Math.abs(euNumber(row[0]) - eu);
      if (Number.isFinite(d) && (!best || d < best.d || (d === best.d && euNumber(row[0]) > euNumber(best.t.rows[best.i][0])))) {
        best = { t, i, d };
      }
    });
  }
  if (!best) return null;
  const b: { t: SizeTable; i: number; d: number } = best;
  const row = b.t.rows[b.i];
  return {
    kind: "shoe",
    label: row[0],
    fit: b.d < 0.2 ? "good" : b.d <= 1 ? "approx" : "out",
    table: b.t.title,
    variant: false,
    extra: b.t.headers.slice(1).map((header, j) => ({ header, value: row[j + 1] })),
    borrowed: false,
  };
}

export function recommend(brands: SizeBrand[], m: Measures): Result {
  const ref = brands.find((b) => b.id === REFERENCE_ID);
  const out: BrandResult[] = [];
  const suitOf = new Map<string, Item>();

  const compute = (brand: SizeBrand): Item[] => {
    const items: Item[] = [];
    const suitT = tablesFor(brand, ref, "suit", m.profile);
    const suit = measured(suitT.tables, "suit", m, suitT.borrowed);
    if (suit) {
      if (m.profile === "nino") suit.item.grow = growHint(suit.table, suit.row, m.height);
      items.push(suit.item);
      suitOf.set(brand.id, suit.item);
    }

    const vestT = tablesFor(brand, ref, "vest", m.profile);
    const byBody = vestT.tables.filter((t) => t.headers.some((h) => plain(h).startsWith("talla de peto")));
    const bySuit = vestT.tables.filter((t) => !byBody.includes(t));
    let vest = byBody.length ? measured(byBody, "vest", m, vestT.borrowed)?.item : undefined;
    // Peto por talla de traje: con la del propio traje o, si la marca no tiene tabla de traje (NPT), la de la referencia.
    const suitForVest = suit?.item ?? (ref ? suitOf.get(ref.id) : undefined);
    if (!vest && bySuit.length && suitForVest) {
      vest = vestBySuit(bySuit, m.profile, suitForVest, vestT.borrowed) ?? undefined;
    }
    if (vest) items.push(vest);

    const jacketT = tablesFor(brand, ref, "jacket", m.profile);
    const jacket = measured(jacketT.tables, "jacket", m, jacketT.borrowed);
    if (jacket) items.push(jacket.item);

    if (m.head !== undefined) {
      const maskT = tablesFor(brand, ref, "mask", m.profile);
      const mask = measured(maskT.tables, "mask", { ...m, height: NaN, age: undefined, chest: undefined, waist: undefined, hip: undefined }, maskT.borrowed);
      if (mask) items.push(mask.item);
    }

    if (m.hand !== undefined) {
      const gloveT = tablesFor(brand, ref, "glove", m.profile);
      const g = glove(gloveT.tables, m.hand, gloveT.borrowed);
      if (g) items.push(g);
    }
    return items;
  };

  // La referencia primero, para que las marcas que dependen de ella (NPT) la tengan calculada.
  const order = [...brands].sort((a, b) => Number(b.id === REFERENCE_ID) - Number(a.id === REFERENCE_ID));
  const done = new Map(order.map((b) => [b.id, compute(b)]));
  brands.forEach((b) => out.push({ id: b.id, items: done.get(b.id) ?? [] }));

  return { brands: out, shoe: m.shoe !== undefined ? shoe(brands, m.shoe) : null };
}

// ---------------------------------------------------------------------------
// Para preseleccionar la talla en la ficha de producto
// ---------------------------------------------------------------------------

/** Formas en que un proveedor puede escribir la misma talla ("0 (S)" → "0", "S"; "X-Small" → "XS"; "7,5" → "7.5"). */
export function sizeAliases(label: string): string[] {
  const out = new Set<string>([label]);
  const paren = label.match(/^(.+?)\s*\((.+)\)$/);
  if (paren) {
    out.add(paren[1].trim());
    out.add(paren[2].trim());
  }
  const word = label.match(/^((?:x-?)*)\s*(small|medium|large)$/i);
  if (word) {
    const x = (word[1].match(/x/gi) ?? []).length;
    out.add("X".repeat(x) + word[2][0].toUpperCase());
  }
  if (/^\d+,\d+$/.test(label)) out.add(label.replace(",", "."));
  return [...out];
}

/** Tallas guardadas: por marca y tipo de prenda, las formas válidas de la talla recomendada. */
export type SavedSizes = {
  v: 1;
  brands: Record<string, Partial<Record<Kind, string[]>>>;
  shoe?: string[];
};

export function toSaved(result: Result): SavedSizes {
  const brands: SavedSizes["brands"] = {};
  for (const b of result.brands) {
    const kinds: Partial<Record<Kind, string[]>> = {};
    for (const it of b.items) if (it.fit !== "out") kinds[it.kind] = sizeAliases(it.label);
    brands[b.id] = kinds;
  }
  const s: SavedSizes = { v: 1, brands };
  if (result.shoe && result.shoe.fit !== "out") s.shoe = sizeAliases(result.shoe.label);
  return s;
}
