import type { NextConfig } from "next";

// Vacío quiere decir "se sirve desde la raíz del dominio" (producción).
// Se pone a algo como "/nuevo" cuando el export se sube a una subcarpeta
// de pruebas en vez de al raíz — así los enlaces internos y los assets
// de Next.js (/_next/...) apuntan al sitio correcto en cada caso.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  // El hosting de destino (OVH Web Cloud, plan compartido) solo sirve PHP
  // estático vía Apache — no ejecuta Node.js. Exportamos el sitio como
  // HTML puro; las redirecciones 301 y el envío del formulario se
  // resuelven en public/.htaccess y public/contact.php (ver ese archivo).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
};

export default nextConfig;
