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
  /** Referencia y ficha del proveedor (opcionales). */
  ref: string;
  url: string;
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
    ref: str(raw.ref),
    url: str(raw.url),
  };
}

export const shopIntro: string = data.intro;
export const shopOrderEmail: string = data.orderEmail;

export const shopProducts: ShopProduct[] = (data.products as RawProduct[])
  .map(normalize)
  .filter((p) => p.active && p.id && p.name);

export const shopCategories = ["Protección", "Armas", "Ropa", "Accesorios"];

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
