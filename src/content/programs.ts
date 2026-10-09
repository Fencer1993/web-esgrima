import programas from "./data/programas.json";
import equipo from "./data/equipo.json";
import { publicImageSize } from "@/lib/imageSize";

export type Program = {
  slug: "esgrima-ninos" | "esgrima-para-adultos" | "esgrima-en-silla-de-ruedas";
  title: string;
  tagline: string;
  ageRange: string;
  schedule: string;
  // Fragmento del nombre de una foto de content/gallery.ts
  photo: string;
};

// Editables desde el panel (/admin): src/content/data/programas.json y
// src/content/data/equipo.json.
export const programs = programas.programs as Program[];

export const values = programas.values as {
  icon: "companerismo" | "aprendizaje" | "inclusion";
  title: string;
  body: string;
}[];

export const coaches = equipo.coaches.map(({ photo, photoAlt, ...c }) => ({
  ...c,
  photo: { src: photo, alt: photoAlt, ...publicImageSize(photo) },
}));
