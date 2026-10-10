import "server-only";
import data from "./data/galeria.json";
import dataEn from "./data/en/galeria.json";
import { publicImageSize } from "@/lib/imageSize";

// Datos editables desde el panel (/admin): src/content/data/galeria.json.
// "En nuestra sala" = la sala del club (tarima, armeros, espejos);
// "Competiciones" = cualquier otro pabellón.
export type GalleryCategory = string;

export type GalleryItem = {
  caption: string;
  category: GalleryCategory;
  src: string;
  width: number;
  height: number;
  // Texto alternativo: describe lo que se ve (no repite el pie de foto).
  alt: string;
};

export const galleryItems: GalleryItem[] = data.items.map((i) => ({
  ...i,
  alt: i.alt || i.caption,
  ...publicImageSize(i.src),
}));

// Busca una foto de la galería por un fragmento de su nombre de archivo.
export function galleryPhoto(name: string): GalleryItem {
  const item = galleryItems.find((g) => g.src.includes(name));
  if (!item) throw new Error(`Foto no encontrada en galeria.json: ${name}`);
  return item;
}

// Versión en inglés de los pies y textos alternativos (data/en/galeria.json,
// emparejados por `src`). Si falta una foto, se queda el texto en español.
export type GalleryLang = "es" | "en";

const enBySrc = new Map(dataEn.items.map((i) => [i.src, i]));

export function localizedGalleryItems(lang: GalleryLang): GalleryItem[] {
  if (lang === "es") return galleryItems;
  return galleryItems.map((g) => {
    const t = enBySrc.get(g.src);
    return t ? { ...g, caption: t.caption, alt: t.alt || t.caption } : g;
  });
}

export function localizedGalleryPhoto(name: string, lang: GalleryLang): GalleryItem {
  const item = localizedGalleryItems(lang).find((g) => g.src.includes(name));
  if (!item) throw new Error(`Foto no encontrada en galeria.json: ${name}`);
  return item;
}
