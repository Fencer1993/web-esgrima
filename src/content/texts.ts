import data from "./data/textos.json";

// Editable desde el panel (/admin): src/content/data/textos.json.
export type PageText = {
  path: string;
  eyebrow: string;
  title: string;
  lede: string;
};

export type HomeText = (typeof data)["inicio"];

export const homeText: HomeText = data.inicio;

/** Cabecera (etiqueta, título y entradilla) de una página interior. */
export function pageText(path: string): PageText {
  const found = data.paginas.find((p) => p.path === path);
  if (!found) {
    throw new Error(
      `Falta el texto de la página "${path}" en src/content/data/textos.json`,
    );
  }
  return found;
}
