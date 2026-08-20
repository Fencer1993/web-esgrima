import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El hosting de destino (OVH Web Cloud, plan compartido) solo sirve PHP
  // estático vía Apache — no ejecuta Node.js. Exportamos el sitio como
  // HTML puro; las redirecciones 301 y el envío del formulario se
  // resuelven en public/.htaccess y public/contact.php (ver ese archivo).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
