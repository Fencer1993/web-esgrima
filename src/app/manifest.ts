import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Next no antepone el basePath a lo que devuelve el manifest: se hace aquí.
// En producción BASE_PATH está vacío (raíz del dominio).
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Mismos valores que los tokens de src/app/globals.css (--paper / --ink).
const BACKGROUND = "#ffffff";
const THEME = "#17232b";

export default function manifest(): MetadataRoute.Manifest {
  const shortcutIcon = [
    { src: `${base}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
  ];
  return {
    id: `${base}/`,
    name: "Club de Esgrima Torremolinos",
    short_name: "Esgrima Torremolinos",
    description:
      "Clases de esgrima en Torremolinos (Málaga) para niños, adultos y en silla de ruedas. Primera clase gratis.",
    lang: "es",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait",
    start_url: `${base}/?source=pwa`,
    scope: `${base}/`,
    background_color: BACKGROUND,
    theme_color: THEME,
    categories: ["sports", "education"],
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: `${base}/icons/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Clase gratis", url: `${base}/clase-gratis/`, icons: shortcutIcon },
      { name: "Horarios y precios", url: `${base}/horarios-y-precios/`, icons: shortcutIcon },
      { name: "Tienda", url: `${base}/tienda/`, icons: shortcutIcon },
      { name: "Calendario", url: `${base}/calendario/`, icons: shortcutIcon },
    ],
  };
}
