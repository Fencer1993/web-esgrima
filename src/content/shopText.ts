import type { Lang } from "./i18n";

// Textos de interfaz de la tienda (ShopApp, SizeGuide) en español e inglés y
// traducciones SOLO DE PANTALLA de categorías, opciones y valores. Los valores
// que viajan al servidor (carrito, pedido.php) y los que se guardan en
// localStorage siguen siendo siempre los del español ("Diestro", "Color"…).
// No importa nada del sistema de archivos: lo usan componentes de cliente.

export const categoryEn: Record<string, string> = {
  "Sables y hojas": "Sabres and blades",
  Caretas: "Masks",
  "Chaquetas eléctricas": "Electric jackets (lamés)",
  "Guantes y manguitos": "Gloves and cuffs",
  Trajes: "Jackets and breeches",
  Protección: "Protection",
  "Calzado y medias": "Shoes and socks",
  "Piezas y recambios": "Parts and spares",
  "Pasantes y conectores": "Body wires and connectors",
  "Kits de iniciación": "Starter kits",
  "Iniciación (plástico y espuma)": "Beginners (plastic and foam)",
  "Material de maestro": "Coach equipment",
  "Silla de ruedas": "Wheelchair fencing",
  Otros: "Other",
};

const optionNameEn: Record<string, string> = {
  Color: "Colour",
  Cazoleta: "Guard",
  Puño: "Grip",
  Material: "Material",
  Sexo: "Cut",
  Dureza: "Stiffness",
  Hoja: "Blade",
  Tamaño: "Size",
};

const handEn: Record<string, string> = { Diestro: "Right-handed", Zurdo: "Left-handed" };

// Palabras sueltas de los valores de opciones ("Diestro aluminio", "Azul"…).
const wordEn: Record<string, string> = {
  rojo: "red",
  azul: "blue",
  rosa: "pink",
  oro: "gold",
  arcoiris: "rainbow",
  negro: "black",
  verde: "green",
  amarillo: "yellow",
  marrón: "brown",
  blanco: "white",
  gris: "grey",
  mujer: "women's",
  hombre: "men's",
  niño: "children's",
  brazo: "arm",
  pierna: "leg",
  aluminio: "aluminium",
  titanio: "titanium",
  diestro: "right-handed",
  zurdo: "left-handed",
};

/** "3,28 €" → "€3.28". Solo cambia importes con €. */
export function euroEn(s: string): string {
  return s.replace(/(\d+(?:[.,]\d+)?)\s?€/g, (_, n: string) => `€${n.replace(",", ".")}`);
}

/** "Desde 87,36 €" → "From €87.36"; "62,07 €" → "€62.07". */
export function priceLabel(price: string, lang: Lang): string {
  if (lang === "es") return price;
  const t = price.trim();
  const from = t.match(/^desde\s+(.+)$/i);
  return from ? `From ${euroEn(from[1])}` : euroEn(t);
}

export function categoryLabel(c: string, lang: Lang): string {
  return lang === "es" ? c : (categoryEn[c] ?? c);
}

export function optionNameLabel(name: string, lang: Lang): string {
  return lang === "es" ? name : (optionNameEn[name] ?? name);
}

export function handLabel(hand: string, lang: Lang): string {
  return lang === "es" ? hand : (handEn[hand] ?? hand);
}

/** Valor de una opción para mostrar ("Zurdo Titanio (+3,28 €)" → "Left-handed titanium (+€3.28)"). */
export function optionValueLabel(value: string, lang: Lang): string {
  if (lang === "es") return value;
  return euroEn(value).replace(/[A-Za-zÀ-ÿ]+/g, (w, offset: number) => {
    const t = wordEn[w.toLowerCase()];
    if (!t) return w;
    return offset === 0 ? t[0].toUpperCase() + t.slice(1) : t;
  });
}

/** "Talla 8 · Zurdo · Color: Azul" en el idioma de la página. */
export function cartLineLabel(
  l: { size: string; hand: string; options: Record<string, string> },
  lang: Lang,
): string {
  const opts = Object.entries(l.options)
    .map(([k, v]) => `${optionNameLabel(k, lang)}: ${optionValueLabel(v, lang)}`)
    .join(" · ");
  return [
    l.size && (lang === "en" ? `Size ${l.size}` : `Talla ${l.size}`),
    l.hand && handLabel(l.hand, lang),
    opts,
  ]
    .filter(Boolean)
    .join(" · ");
}

const es = {
  allChip: "Todo",
  favChip: "Favoritos",
  filterByCategory: "Filtrar por categoría",
  searchLabel: "Buscar en la tienda",
  searchPlaceholder: "Buscar producto o proveedor",
  product: "producto",
  products: "productos",
  noFavs: "Aún no has marcado favoritos. Pulsa el corazón de un producto para guardarlo.",
  noMatches: "No hay productos que coincidan con tu búsqueda.",
  seeMore: (n: number) => `Ver más productos (${n})`,
  viewProduct: (name: string, supplier: string) => `Ver ${name}, ${supplier}`,
  removeFav: (name?: string) => (name ? `Quitar ${name} de favoritos` : "Quitar de favoritos"),
  addFav: (name?: string) => (name ? `Añadir ${name} a favoritos` : "Añadir a favoritos"),
  openCart: (units: number) => `Abrir carrito, ${units} ${units === 1 ? "artículo" : "artículos"}`,
  cart: "Carrito",
  close: "Cerrar",
  closeCart: "Cerrar carrito",
  refPrefix: "Ref.",
  sizeGuideLink: "Ver tabla de tallas y cómo medirte →",
  calcLink: "Calcula tu talla →",
  yourSize: "Tu talla según la calculadora",
  addSize: (size: string) => `Añadir talla ${size}`,
  addSizeFor: (size: string, name: string) => `Añadir talla ${size}: ${name}`,
  addedToast: (name: string, size: string) => `${name}, talla ${size}, añadido al carrito.`,
  viewCart: "Ver carrito",
  mineChip: "En mi talla",
  removeMineFilter: "Quitar el filtro «En mi talla»",
  noMine: "Ningún producto tiene ahora mismo tus tallas guardadas.",
  supplierSheet: (supplier: string, withSizes: boolean) =>
    `Ver ficha${withSizes ? " y tabla de tallas" : ""} en ${supplier} →`,
  size: "Talla",
  hand: "Mano",
  quantity: "Cantidad",
  quantityOf: (name: string) => `Cantidad de ${name}`,
  oneLess: "Una unidad menos",
  oneMore: "Una unidad más",
  addToCart: "Añadir al carrito",
  errSize: "Elige una talla.",
  errHand: "Elige la mano (diestro o zurdo).",
  errOption: (name: string) => `Elige ${name.toLowerCase()}.`,
  errMaxLines: (n: number) => `Un pedido admite como máximo ${n} líneas. Quita alguna.`,
  errSend: "No se pudo enviar la solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.",
  errNetwork: "No se pudo enviar la solicitud. Revisa tu conexión o escríbenos por WhatsApp.",
  headingDone: "Solicitud enviada",
  headingCheckout: "Tus datos",
  headingCart: "Tu carrito",
  received: "Solicitud recibida",
  refLabel: "ref.",
  copySent:
    "Te hemos enviado una copia por correo. El club te avisará del importe antes de hacer el pedido al proveedor.",
  backToShop: "Volver a la tienda",
  emptyCart: "Tu carrito está vacío.",
  keepBrowsing: "Seguir mirando",
  finalAmount: "El importe final te lo confirma el club antes de pedir al proveedor.",
  requestOrder: (units: number) => `Solicitar pedido (${units} ${units === 1 ? "ud." : "uds."})`,
  remove: "Quitar",
  removeLine: (name: string, opts: string) => `Quitar ${name}${opts ? ` (${opts})` : ""}`,
  requestNote:
    "Esto es una solicitud: el club agrupa los pedidos y te avisa del importe antes de pedirlo al proveedor.",
  name: "Nombre del socio",
  email: "Correo electrónico",
  phone: "Teléfono",
  notes: "Notas (opcional)",
  notesPlaceholder: "Medidas, modelo preferido…",
  privacyBefore: "He leído y acepto la",
  privacyLink: "política de privacidad",
  privacyHref: "/politica-de-privacidad",
  sending: "Enviando…",
  submit: "Enviar solicitud de pedido",
  backToCart: "← Volver al carrito",
};

type ShopUi = typeof es;

const en: ShopUi = {
  allChip: "All",
  favChip: "Favourites",
  filterByCategory: "Filter by category",
  searchLabel: "Search the shop",
  searchPlaceholder: "Search by product or supplier",
  product: "product",
  products: "products",
  noFavs: "You have no favourites yet. Tap the heart on a product to save it.",
  noMatches: "No products match your search.",
  seeMore: (n) => `Show more products (${n})`,
  viewProduct: (name, supplier) => `View ${name}, ${supplier}`,
  removeFav: (name) => (name ? `Remove ${name} from favourites` : "Remove from favourites"),
  addFav: (name) => (name ? `Add ${name} to favourites` : "Add to favourites"),
  openCart: (units) => `Open basket, ${units} ${units === 1 ? "item" : "items"}`,
  cart: "Basket",
  close: "Close",
  closeCart: "Close basket",
  refPrefix: "Ref.",
  sizeGuideLink: "See the size chart and how to measure yourself →",
  calcLink: "Work out your size →",
  yourSize: "Your size from the calculator",
  addSize: (size) => `Add size ${size}`,
  addSizeFor: (size, name) => `Add size ${size}: ${name}`,
  addedToast: (name, size) => `${name}, size ${size}, added to the basket.`,
  viewCart: "View basket",
  mineChip: "In my size",
  removeMineFilter: "Remove the “In my size” filter",
  noMine: "No product currently comes in your saved sizes.",
  supplierSheet: (supplier, withSizes) =>
    `See the product page${withSizes ? " and size chart" : ""} at ${supplier} →`,
  size: "Size",
  hand: "Hand",
  quantity: "Quantity",
  quantityOf: (name) => `Quantity of ${name}`,
  oneLess: "One fewer",
  oneMore: "One more",
  addToCart: "Add to basket",
  errSize: "Please choose a size.",
  errHand: "Please choose a hand (right-handed or left-handed).",
  errOption: (name) => `Please choose a ${name.toLowerCase()}.`,
  errMaxLines: (n) => `An order can have at most ${n} lines. Please remove some.`,
  errSend: "We could not send your request. Please try again or message us on WhatsApp.",
  errNetwork: "We could not send your request. Please check your connection or message us on WhatsApp.",
  headingDone: "Request sent",
  headingCheckout: "Your details",
  headingCart: "Your basket",
  received: "Request received",
  refLabel: "ref.",
  copySent:
    "We have emailed you a copy. The club will tell you the total before placing the order with the supplier.",
  backToShop: "Back to the shop",
  emptyCart: "Your basket is empty.",
  keepBrowsing: "Keep browsing",
  finalAmount: "The club will confirm the final total before ordering from the supplier.",
  requestOrder: (units) => `Request order (${units} ${units === 1 ? "item" : "items"})`,
  remove: "Remove",
  removeLine: (name, opts) => `Remove ${name}${opts ? ` (${opts})` : ""}`,
  requestNote:
    "This is a request: the club groups members' orders and will tell you the total before ordering from the supplier.",
  name: "Member's name",
  email: "Email address",
  phone: "Phone number",
  notes: "Notes (optional)",
  notesPlaceholder: "Measurements, preferred model…",
  privacyBefore: "I have read and accept the",
  privacyLink: "privacy policy (in Spanish)",
  privacyHref: "/politica-de-privacidad",
  sending: "Sending…",
  submit: "Send order request",
  backToCart: "← Back to basket",
};

export const shopUi: Record<Lang, ShopUi> = { es, en };
