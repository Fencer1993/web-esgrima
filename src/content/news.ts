import "server-only";
import data from "./data/noticias.json";
import { publicImageSize } from "@/lib/imageSize";

// Editable desde el panel (/admin): src/content/data/noticias.json.
export const newsTypes = ["Noticia", "Aviso", "Convocatoria", "Resultado"] as const;
export type NewsType = (typeof newsTypes)[number];

export type NewsItem = {
  slug: string;
  date: string; // YYYY-MM-DD
  type: NewsType;
  title: string;
  summary: string;
  paragraphs: string[];
  image?: { src: string; width: number; height: number };
  pinned: boolean;
};

export const allNews: NewsItem[] = data.items
  .filter((i) => i.slug.trim() && i.title.trim())
  .map((i) => ({
    slug: i.slug.trim(),
    date: i.date.slice(0, 10),
    type: (newsTypes as readonly string[]).includes(i.type) ? (i.type as NewsType) : "Noticia",
    title: i.title,
    summary: i.summary,
    paragraphs: i.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    image: i.image ? { src: i.image, ...publicImageSize(i.image) } : undefined,
    pinned: Boolean(i.pinned),
  }))
  .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date));

export function newsBySlug(slug: string): NewsItem | undefined {
  return allNews.find((n) => n.slug === slug);
}

// Fecha en español, p. ej. "9 de octubre de 2026" (UTC para no depender de la zona).
export function formatNewsDate(date: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
