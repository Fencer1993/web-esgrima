import "server-only";
import data from "./data/equipo.json";
import { publicImageSize } from "@/lib/imageSize";

// Editable desde el panel (/admin): src/content/data/equipo.json.
// Solo nombre de pila: muchos deportistas son menores, así que no se
// guardan apellidos, fechas de nacimiento ni fotos salvo que se suban a mano.
export type Athlete = {
  name: string;
  slug: string;
  achievement: string;
  bio?: string;
  weapon?: string;
  since?: number;
  photo?: { src: string; width: number; height: number };
};

type RawAthlete = {
  name: string;
  achievement?: string;
  photo?: string;
  slug?: string;
  bio?: string;
  weapon?: string;
  since?: number | string;
};

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const athletes: Athlete[] = (data.athletes as RawAthlete[])
  .filter((a) => a.name.trim())
  .map((a) => {
    const since = Number(a.since);
    return {
      name: a.name,
      slug: a.slug?.trim() || slugify(a.name),
      achievement: a.achievement ?? "",
      bio: a.bio?.trim() || undefined,
      weapon: a.weapon?.trim() || undefined,
      since: Number.isFinite(since) && since > 1900 ? since : undefined,
      photo: a.photo ? { src: a.photo, ...publicImageSize(a.photo) } : undefined,
    };
  });
