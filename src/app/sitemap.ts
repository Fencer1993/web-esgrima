import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { allNews } from "@/content/news";
import { galleryItems } from "@/content/gallery";
import { coaches } from "@/content/programs";
import { allTournaments } from "@/content/results";
import { athletesWithPage } from "@/content/athletePages";

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
  return [
    ...routes,
    ...allNews.map((n) => `noticias/${n.slug}`),
    ...allTournaments.map((t) => `resultados/${t.slug}`),
    ...athletesWithPage.map((a) => `deportistas/${a.slug}`),
  ].map((route) => ({
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
  }));
}
