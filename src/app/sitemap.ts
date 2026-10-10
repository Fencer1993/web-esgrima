import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { allNews } from "@/content/news";
import { galleryItems } from "@/content/gallery";
import { coaches } from "@/content/programs";
import { allTournaments } from "@/content/results";
import { athletesWithPage } from "@/content/athletePages";
import { equivalentPath, pathPairs } from "@/content/i18n";

const routes = [
  "",
  "esgrima-ninos",
  "esgrima-para-adultos",
  "esgrima-en-silla-de-ruedas",
  "nuestro-equipo",
  "horarios-y-precios",
  "instalaciones",
  "clase-gratis",
  "preguntas-frecuentes",
  "contacto",
  "noticias",
  "calendario",
  "tienda",
  "resultados",
  "patrocinadores",
];

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const spanish: MetadataRoute.Sitemap = [
    ...routes,
    ...allNews.map((n) => `noticias/${n.slug}`),
    ...allTournaments.map((t) => `resultados/${t.slug}`),
    ...athletesWithPage.map((a) => `deportistas/${a.slug}`),
  ].map((route) => {
    const en = equivalentPath(`/${route}`, "en");
    return {
      url: `${site.url}/${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: route === "" ? 1 : 0.7,
      images:
        route === "instalaciones"
          ? galleryItems.map((g) => `${site.url}${g.src}`)
          : route === "nuestro-equipo"
            ? coaches.map((c) => `${site.url}${c.photo.src}`)
            : undefined,
      // Páginas con versión inglesa: hreflang en las dos direcciones.
      alternates: en
        ? {
            languages: {
              es: `${site.url}/${route}`,
              en: `${site.url}${en}`,
              "x-default": `${site.url}/${route}`,
            },
          }
        : undefined,
    };
  });

  // Versión inglesa (/en/...), a partir del mapa de rutas de content/i18n.ts.
  const english: MetadataRoute.Sitemap = pathPairs.map((pair) => {
    const es = pair.es === "/" ? `${site.url}/` : `${site.url}${pair.es}`;
    return {
      url: `${site.url}${pair.en}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: pair.en === "/en/" ? 0.9 : 0.6,
      images:
        pair.en === "/en/our-team"
          ? coaches.map((c) => `${site.url}${c.photo.src}`)
          : undefined,
      alternates: {
        languages: { es, en: `${site.url}${pair.en}`, "x-default": es },
      },
    };
  });

  return [...spanish, ...english];
}
