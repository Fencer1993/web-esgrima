import "server-only";
import data from "./data/equipo.json";
import { publicImageSize } from "@/lib/imageSize";

// Editable desde el panel (/admin): src/content/data/equipo.json.
export type Athlete = {
  name: string;
  achievement: string;
  photo?: { src: string; width: number; height: number };
};

export const athletes: Athlete[] = data.athletes
  .filter((a) => a.name.trim())
  .map((a) => ({
    name: a.name,
    achievement: a.achievement,
    photo: a.photo ? { src: a.photo, ...publicImageSize(a.photo) } : undefined,
  }));
