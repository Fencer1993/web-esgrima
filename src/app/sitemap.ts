import type { MetadataRoute } from "next";
import { site } from "@/content/site";

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
];

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${site.url}/${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
