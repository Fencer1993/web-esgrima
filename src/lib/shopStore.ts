// Carrito y favoritos de la tienda en localStorage, expuestos como store
// externo (useSyncExternalStore). Todo acceso a localStorage va en try/catch:
// sin almacenamiento la tienda funciona igual, solo que sin persistencia.

export type CartLine = {
  key: string;
  productId: string;
  size: string;
  hand: string;
  /** Otras opciones elegidas (color, cazoleta…): {nombre: valor}. */
  options: Record<string, string>;
  qty: number;
};

export type ShopState = { cart: CartLine[]; favs: string[] };

export const MAX_QTY = 5;
export const MAX_LINES = 20;

const KEY = "club-tienda-v1";
const EMPTY: ShopState = { cart: [], favs: [] };

let state: ShopState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): ShopState {
  if (!raw) return EMPTY;
  try {
    const d = JSON.parse(raw) as Partial<ShopState>;
    const cart = Array.isArray(d.cart)
      ? d.cart
          .filter(
            (l): l is CartLine =>
              !!l && typeof l.productId === "string" && Number.isInteger(l.qty),
          )
          .map((l) => {
            const options = cleanOptions(l.options);
            return {
              key: lineKey(l.productId, String(l.size ?? ""), String(l.hand ?? ""), options),
              productId: l.productId,
              size: String(l.size ?? ""),
              hand: String(l.hand ?? ""),
              options,
              qty: Math.min(MAX_QTY, Math.max(1, l.qty)),
            };
          })
      : [];
    const favs = Array.isArray(d.favs)
      ? d.favs.filter((f): f is string => typeof f === "string")
      : [];
    return { cart, favs };
  } catch {
    return EMPTY;
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = parse(window.localStorage.getItem(KEY));
  } catch {
    state = EMPTY;
  }
}

function set(next: ShopState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* sin almacenamiento: se mantiene solo en memoria */
  }
  listeners.forEach((l) => l());
}

function cleanOptions(v: unknown): Record<string, string> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  return Object.fromEntries(
    Object.entries(v as Record<string, unknown>).filter(
      (e): e is [string, string] => typeof e[1] === "string" && e[1] !== "",
    ),
  );
}

/** Texto legible de las opciones: "Color: Azul · Puño: Retro". */
export function optionsLabel(options: Record<string, string>) {
  return Object.entries(options)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}

export function lineKey(
  productId: string,
  size: string,
  hand: string,
  options: Record<string, string> = {},
) {
  return `${productId}|${size}|${hand}|${optionsLabel(options)}`;
}

export function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    state = parse(e.newValue);
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const getSnapshot = (): ShopState => {
  load();
  return state;
};
export const getServerSnapshot = (): ShopState => EMPTY;

export function addToCart(p: {
  productId: string;
  size: string;
  hand: string;
  options: Record<string, string>;
  qty: number;
}) {
  const key = lineKey(p.productId, p.size, p.hand, p.options);
  const existing = state.cart.find((l) => l.key === key);
  const cart = existing
    ? state.cart.map((l) =>
        l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + p.qty) } : l,
      )
    : [...state.cart, { key, ...p, qty: Math.min(MAX_QTY, p.qty) }];
  set({ ...state, cart });
}

export function setQty(key: string, qty: number) {
  const q = Math.min(MAX_QTY, Math.max(1, qty));
  set({ ...state, cart: state.cart.map((l) => (l.key === key ? { ...l, qty: q } : l)) });
}

export function removeLine(key: string) {
  set({ ...state, cart: state.cart.filter((l) => l.key !== key) });
}

export function clearCart() {
  set({ ...state, cart: [] });
}

export function toggleFav(id: string) {
  set({
    ...state,
    favs: state.favs.includes(id) ? state.favs.filter((f) => f !== id) : [...state.favs, id],
  });
}
