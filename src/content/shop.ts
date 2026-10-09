import data from "./data/tienda.json";

// Editable desde el panel (/admin): src/content/data/tienda.json.
export type ShopProduct = {
  id: string;
  name: string;
  supplier: string;
  category: string;
  description: string;
  price: string;
  sizes: string[];
  photo: string;
  active: boolean;
  // Referencia y ficha del proveedor (opcionales).
  ref?: string;
  url?: string;
};

export const shopIntro: string = data.intro;
export const shopOrderEmail: string = data.orderEmail;

export const shopProducts: ShopProduct[] = (data.products as ShopProduct[]).filter(
  (p) => p.active,
);

export const shopCategories = ["Protección", "Armas", "Ropa", "Accesorios"];

/** Productos activos agrupados por categoría (orden fijo; las desconocidas al final). */
export function productsByCategory(): { category: string; items: ShopProduct[] }[] {
  const extra = shopProducts
    .map((p) => p.category)
    .filter((c, i, a) => !shopCategories.includes(c) && a.indexOf(c) === i);
  return [...shopCategories, ...extra]
    .map((category) => ({
      category,
      items: shopProducts.filter((p) => p.category === category),
    }))
    .filter((g) => g.items.length > 0);
}
