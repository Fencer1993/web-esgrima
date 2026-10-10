import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

// Los rastreadores de búsqueda y de asistentes de IA pueden leer todo el
// sitio. Ya lo permitiría la regla "*"; se nombran para dejar la intención
// por escrito y que nadie la cambie sin darse cuenta.
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/admin-auth/", "/gestion/", "/offline/"] },
      { userAgent: aiCrawlers, allow: "/", disallow: ["/admin/", "/admin-auth/", "/gestion/", "/offline/"] },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
