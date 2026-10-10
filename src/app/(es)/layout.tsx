import type { Metadata, Viewport } from "next";
import { Archivo, Rajdhani, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RevealController } from "@/components/RevealController";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PwaRegister } from "@/components/PwaRegister";
import { site } from "@/content/site";
import { businessJsonLd } from "@/lib/businessJsonLd";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

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
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Clases de esgrima en Málaga`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: site.name,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
  },
  // PWA: el manifest sale de src/app/manifest.ts; iOS no lo lee todo, de ahí
  // appleWebApp y el apple-touch-icon (generado con .github/scripts/generate-pwa-icons.mjs).
  appleWebApp: { capable: true, title: "Esgrima Torremolinos", statusBarStyle: "default" },
  // Next 16 solo emite mobile-web-app-capable; iOS antiguo busca el prefijo apple-.
  other: { "apple-mobile-web-app-capable": "yes" },
  icons: {
    apple: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icons/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#17232b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = businessJsonLd("es");

  return (
    <html
      lang="es"
      className={`${archivo.variable} ${rajdhani.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <RevealController />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppFloat />
        <PwaRegister />
      </body>
    </html>
  );
}
