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
  // Hay dos layouts raíz ((es) y (en)), así que el 404 sale de
  // src/app/global-not-found.tsx en vez de componerse con un layout.
  experimental: { globalNotFound: true },
  images: { unoptimized: true },
  basePath: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
