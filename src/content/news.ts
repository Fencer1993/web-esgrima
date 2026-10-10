import "server-only";
import data from "./data/noticias.json";
import { publicImageSize } from "@/lib/imageSize";

// Editable desde el panel (/admin): src/content/data/noticias.json.
export const newsTypes = ["Noticia", "Aviso", "Convocatoria", "Resultado"] as const;
export type NewsType = (typeof newsTypes)[number];

export const newsTypeEn: Record<NewsType, string> = {
  Noticia: "News",
  Aviso: "Notice",
  Convocatoria: "Call-up",
  Resultado: "Result",
};

/** Texto inglés opcional (title_en / summary_en / body_en); vacío si no hay. */
export type NewsEn = { title: string; summary: string; paragraphs: string[] };

export type NewsItem = {
  slug: string;
  date: string; // YYYY-MM-DD
  type: NewsType;
  title: string;
  summary: string;
  paragraphs: string[];
  image?: { src: string; width: number; height: number };
  pinned: boolean;
  /** Traducción inglesa si el título y el texto están traducidos; si no, undefined. */
  en?: NewsEn;
};

type RawItem = (typeof data.items)[number] & {
  title_en?: string;
  summary_en?: string;
  body_en?: string;
};

const paragraphsOf = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

function englishOf(i: RawItem): NewsEn | undefined {
  const title = (i.title_en ?? "").trim();
  const summary = (i.summary_en ?? "").trim();
  const body = (i.body_en ?? "").trim();
  // Hacen falta los tres campos; si falta alguno se muestra el español entero
  // (así nunca se mezclan idiomas dentro de una misma tarjeta).
  if (!title || !summary || !body) return undefined;
  return {
    title,
    summary,
    paragraphs: paragraphsOf(body),
  };
}

export const allNews: NewsItem[] = (data.items as RawItem[])
  .filter((i) => i.slug.trim() && i.title.trim())
  .map((i) => ({
    slug: i.slug.trim(),
    date: i.date.slice(0, 10),
    type: (newsTypes as readonly string[]).includes(i.type) ? (i.type as NewsType) : "Noticia",
    title: i.title,
    summary: i.summary,
    paragraphs: paragraphsOf(i.body),
    image: i.image ? { src: i.image, ...publicImageSize(i.image) } : undefined,
    pinned: Boolean(i.pinned),
    en: englishOf(i),
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

// Fecha en inglés británico, p. ej. "9 October 2026".
export function formatNewsDateEn(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
