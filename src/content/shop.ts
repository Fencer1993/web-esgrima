import data from "./data/tienda.json";

// Editable desde el panel (/admin): src/content/data/tienda.json.
// El esquema es tolerante: cualquier campo opcional ausente se normaliza.
export type ShopProduct = {
  id: string;
  name: string;
  supplier: string;
  category: string;
  description: string;
  price: string;
  sizes: string[];
  /** Mano (Diestro/Zurdo). Vacío si no aplica. */
  hands: string[];
  photo: string;
  active: boolean;
  /** Otras opciones a elegir (color, cazoleta, puño…). */
  options: { name: string; values: string[] }[];
  /** Referencia, ficha y tabla de tallas del proveedor (opcionales). */
  ref: string;
  url: string;
  sizeGuide: string;
};

type RawProduct = Partial<Record<keyof ShopProduct, unknown>>;

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const strList = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.map((x) => str(typeof x === "number" ? String(x) : x)).filter(Boolean)
    : [];

function normalize(raw: RawProduct): ShopProduct {
  return {
    id: str(raw.id),
    name: str(raw.name),
    supplier: str(raw.supplier),
    category: str(raw.category) || "Otros",
    description: str(raw.description),
    price: str(raw.price),
    sizes: strList(raw.sizes),
    hands: strList(raw.hands),
    photo: str(raw.photo),
    active: raw.active !== false,
    options: Array.isArray(raw.options)
      ? (raw.options as unknown[])
          .map((o) => {
            const r = (o ?? {}) as { name?: unknown; values?: unknown };
            return { name: str(r.name), values: strList(r.values) };
          })
          .filter((o) => o.name && o.values.length > 0)
      : [],
    ref: str(raw.ref),
    url: str(raw.url),
    sizeGuide: str(raw.sizeGuide),
  };
}

export const shopIntro: string = data.intro;
export const shopOrderEmail: string = data.orderEmail;

export const shopProducts: ShopProduct[] = (data.products as RawProduct[])
  .map(normalize)
  .filter((p) => p.active && p.id && p.name);

export const shopCategories = [
  "Sables y hojas",
  "Caretas",
  "Chaquetas eléctricas",
  "Guantes y manguitos",
  "Trajes",
  "Protección",
  "Calzado y medias",
  "Piezas y recambios",
  "Pasantes y conectores",
  "Iniciación (plástico y espuma)",
  "Material de maestro",
  "Silla de ruedas",
];

/** Categorías con productos: primero las conocidas (orden fijo), luego el resto. */
export function activeCategories(): string[] {
  const present = shopProducts
    .map((p) => p.category)
    .filter((c, i, a) => a.indexOf(c) === i);
  return [
    ...shopCategories.filter((c) => present.includes(c)),
    ...present.filter((c) => !shopCategories.includes(c)),
  ];
}
