import data from "./data/cabeceras.json";

// Foto de fondo de la cabecera de cada página interior (fragmento del nombre
// de archivo en gallery.ts). Las páginas sin entrada (legales) no llevan foto.
// Editable desde el panel (/admin): src/content/data/cabeceras.json.
export const pageHeroes: Record<string, { photo: string; position?: string }> =
  Object.fromEntries(
    data.items.map((i) => [i.path, { photo: i.photo, position: i.position }]),
  );
