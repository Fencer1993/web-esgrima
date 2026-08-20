import type { NextConfig } from "next";

const legacyPages = [
  "horarios-y-precios",
  "contacto",
  "instalaciones",
  "clase-gratis",
  "esgrima-ninos",
  "esgrima-para-adultos",
  "esgrima-en-silla-de-ruedas",
  "preguntas-frecuentes",
  "politica-de-privacidad",
  "aviso-legal",
  "politica-de-cookies-ue",
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // El WordPress original servía todo bajo /index.php/<slug>/ por una
      // configuración de enlaces permanentes sin resolver. Estas URLs están
      // indexadas y con tráfico real en Search Console: se redirigen 301 a
      // la misma ruta limpia para no perder el posicionamiento ganado.
      ...legacyPages.map((slug) => ({
        source: `/index.php/${slug}`,
        destination: `/${slug}`,
        permanent: true,
      })),
      // Contenido heredado de la plantilla de demostración original y del
      // post de bienvenida por defecto de WordPress: sin tráfico real, se
      // redirigen a la home en vez de servir un 404.
      { source: "/index.php/skt-karate", destination: "/", permanent: true },
      { source: "/index.php/skt-karate-2", destination: "/", permanent: true },
      {
        source: "/index.php/2022/06/22/bonjour-tout-le-monde",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
