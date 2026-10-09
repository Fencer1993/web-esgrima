import "server-only";
import data from "./data/galeria.json";
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
