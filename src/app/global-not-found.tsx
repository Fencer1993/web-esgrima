import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Rajdhani, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

// Con dos layouts raíz ((es) y (en)) no hay un layout único sobre el que
// componer el 404, así que Next usa este archivo (experimental.globalNotFound,
// ver next.config.ts). Es lo que se publica como /404.html. Se muestra en
// español, con un enlace a la versión inglesa.

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"] });
const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-data",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Página no encontrada — Club de Esgrima Torremolinos",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${rajdhani.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main id="contenido" className="flex-1">
          <div className="mx-auto max-w-6xl px-5 py-24 text-center sm:py-32">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">404</p>
            <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight text-ink sm:text-5xl">
              Página no encontrada
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base text-ink-soft">
              La página que buscas no existe o ha cambiado de sitio.
            </p>
            <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold">
              <Link href="/" className="link-touche text-accent-dark">
                Volver al inicio →
              </Link>
              <Link href="/en/" hrefLang="en" lang="en" className="link-touche text-accent-dark">
                Back to the English home page →
              </Link>
            </p>
          </div>
        </main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
