import type { Metadata, Viewport } from "next";
import { Archivo, Rajdhani, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RevealController } from "@/components/RevealController";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PwaRegister } from "@/components/PwaRegister";
import { site } from "@/content/site";
import { ui } from "@/content/i18n";
import { businessJsonLd } from "@/lib/businessJsonLd";

// Layout raíz de la versión inglesa (/en/...). Existe aparte del español
// ((es)/layout.tsx) para que <html lang="en"> salga ya en el HTML estático.
// Lo que cambie en el layout español (fuentes, scripts globales, PWA…) hay
// que reflejarlo aquí también.

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
    default: `${site.name} — Fencing classes in Málaga`,
    template: `%s — ${site.name}`,
  },
  description: ui.en.siteDescription,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: site.name,
    url: `${site.url}/en/`,
  },
  twitter: {
    card: "summary_large_image",
  },
  appleWebApp: { capable: true, title: "Esgrima Torremolinos", statusBarStyle: "default" },
  other: { "apple-mobile-web-app-capable": "yes" },
  icons: {
    icon: [
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.ico`, sizes: "48x48" },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icons/favicon-96.png`, sizes: "96x96", type: "image/png" },
    ],
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

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = businessJsonLd("en");

  return (
    <html
      lang="en"
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
          {ui.en.skip}
        </a>
        <Header lang="en" />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer lang="en" />
        <WhatsAppFloat lang="en" />
        <PwaRegister lang="en" />
      </body>
    </html>
  );
}
