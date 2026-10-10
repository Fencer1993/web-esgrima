import type { Metadata } from "next";
import { navLinks, navMenu } from "./site";

// Todo lo que une el sitio en español con la versión en inglés (/en/...):
// el mapa de rutas equivalentes, los `alternates` (hreflang) y los textos de
// la "carcasa" (menú, pie, botones). No importa nada que lea el sistema de
// archivos, así que también lo pueden usar los componentes de cliente.
//
// Para añadir una página en inglés: crear la ruta en src/app/(en)/en/…, añadir
// aquí la pareja en `pathPairs` y su cabecera en content/data/en/textos.json.

export type Lang = "es" | "en";

/** Parejas (ruta española, ruta inglesa). Sin barra final, salvo la home. */
export const pathPairs = [
  { es: "/", en: "/en/" },
  { es: "/esgrima-ninos", en: "/en/fencing-for-kids" },
  { es: "/esgrima-para-adultos", en: "/en/fencing-for-adults" },
  { es: "/esgrima-en-silla-de-ruedas", en: "/en/wheelchair-fencing" },
  { es: "/horarios-y-precios", en: "/en/schedule-and-prices" },
  { es: "/clase-gratis", en: "/en/free-trial-class" },
  { es: "/nuestro-equipo", en: "/en/our-team" },
  { es: "/preguntas-frecuentes", en: "/en/faq" },
  { es: "/contacto", en: "/en/contact" },
] as const;

/** Quita la barra final y deja "/" para la raíz ("/en" y "/en/" son la home inglesa). */
function normalize(path: string): string {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}

export function langOfPath(path: string): Lang {
  const p = normalize(path);
  return p === "/en" || p.startsWith("/en/") ? "en" : "es";
}

/** Ruta equivalente en el otro idioma, o null si esa página no tiene versión. */
export function equivalentPath(path: string, target: Lang): string | null {
  const p = normalize(path === "/en" ? "/en/" : path);
  const key = langOfPath(p) === "en" ? "en" : "es";
  const pair = pathPairs.find((x) => normalize(x[key]) === p);
  return pair ? pair[target] : null;
}

/** Ruta española de una ruta inglesa (para fotos de cabecera, etc.). */
export function toSpanishPath(enPath: string): string {
  return equivalentPath(enPath, "es") ?? normalize(enPath);
}

/**
 * `alternates` de Next para una página que existe en los dos idiomas.
 * Se le pasa la ruta de cualquiera de las dos versiones.
 */
export function pageAlternates(path: string): NonNullable<Metadata["alternates"]> {
  const lang = langOfPath(path);
  const es = equivalentPath(path, "es");
  const en = equivalentPath(path, "en");
  if (!es || !en) throw new Error(`Falta la pareja de rutas es/en para "${path}" en content/i18n.ts`);
  return {
    canonical: lang === "en" ? en : es,
    languages: { es, en, "x-default": es },
  };
}

// ---------------------------------------------------------------------------
// Textos de la carcasa del sitio (cabecera, pie, botón de WhatsApp…).
// ---------------------------------------------------------------------------

const enNavMenu = [
  {
    label: "Classes",
    items: [
      { label: "Kids", href: "/en/fencing-for-kids", description: "From age 6, learning through play" },
      { label: "Adults", href: "/en/fencing-for-adults", description: "Recreational or competitive, your choice" },
      { label: "Wheelchair fencing", href: "/en/wheelchair-fencing", description: "Adapted fencing with top-level coaching" },
      { label: "Performance training", href: "/en/schedule-and-prices#tecnificacion", description: "Competition groups on Mondays" },
    ],
  },
  {
    label: "The club",
    items: [
      { label: "Our team", href: "/en/our-team", description: "Coaches and athletes" },
      { label: "Facilities and gallery (in Spanish)", href: "/instalaciones", description: "Where we train" },
      { label: "News (in Spanish)", href: "/noticias", description: "The club's notice board" },
      { label: "Calendar (in Spanish)", href: "/calendario", description: "Competitions and events" },
      { label: "Shop (in Spanish)", href: "/tienda", description: "Kit at a club discount" },
      { label: "FAQ", href: "/en/faq", description: "Equipment, ages, insurance and more" },
    ],
  },
] as const;

const enNavLinks = [
  { label: "Schedule and prices", href: "/en/schedule-and-prices" },
  { label: "Contact", href: "/en/contact" },
] as const;

type NavItem = { label: string; href: string; description: string };
export type NavGroup = { label: string; items: readonly NavItem[] };

export function navFor(lang: Lang): {
  menu: readonly NavGroup[];
  links: readonly { label: string; href: string }[];
} {
  return lang === "en"
    ? { menu: enNavMenu, links: enNavLinks }
    : { menu: navMenu, links: navLinks };
}

export const ui = {
  es: {
    homeHref: "/",
    siteDescription: null as string | null, // el español usa site.description
    skip: "Saltar al contenido",
    home: "Inicio",
    breadcrumb: "Ruta de navegación",
    navMain: "Principal",
    navMobile: "Móvil",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    freeClass: "Clase gratis",
    freeClassMobile: "Prueba una clase gratis",
    langLabel: "Idioma",
    whatsappAria: "Escríbenos por WhatsApp",
    whatsappGeneral: "Hola, quiero información sobre las clases de esgrima",
    whatsappTrial: "Hola, quiero probar una clase gratis",
    instagram: {
      title: "Síguenos en Instagram",
      textBefore: "Entrenamientos, competiciones y el día a día del club, en ",
      cta: "Ver el perfil",
      postAlt: "Publicación de Instagram del club",
    },
  },
  en: {
    homeHref: "/en/",
    siteDescription:
      "Fencing club in Torremolinos (Málaga, Spain). Fencing classes for children from age 6, teenagers, adults and wheelchair fencers. First class free.",
    skip: "Skip to content",
    home: "Home",
    breadcrumb: "Breadcrumb",
    navMain: "Main",
    navMobile: "Mobile",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    freeClass: "Free class",
    freeClassMobile: "Try a free class",
    langLabel: "Language",
    whatsappAria: "Message us on WhatsApp",
    whatsappGeneral: "Hello, I'd like some information about the fencing classes",
    whatsappTrial: "Hello, I'd like to try a free class",
    instagram: {
      title: "Follow us on Instagram",
      textBefore: "Training, competitions and everyday life at the club, on ",
      cta: "View the profile",
      postAlt: "Instagram post from the club",
    },
  },
} as const;

export const footerText = {
  es: {
    ctaEyebrow: "Primera clase gratis",
    ctaTitleBefore: "En guardia:",
    ctaTitleMid: "tu primera clase es ",
    ctaTitleEm: "gratis",
    ctaText:
      "Ven a probar sin compromiso. Te prestamos el material, te explicamos todo y en tu primera clase ya te pones en guardia.",
    ctaButton: "Reservar por WhatsApp",
    ctaLink: "Cómo funciona la clase gratis",
    ctaLinkHref: "/clase-gratis",
    followInstagram: "Síguenos en Instagram",
    club: "Club",
    where: "Dónde estamos",
    map: "Ver en Google Maps",
  },
  en: {
    ctaEyebrow: "First class free",
    ctaTitleBefore: "En garde:",
    ctaTitleMid: "your first class is ",
    ctaTitleEm: "free",
    ctaText:
      "Come and try it, no strings attached. We lend you the equipment, explain everything, and you will be on guard in your very first class.",
    ctaButton: "Book on WhatsApp",
    ctaLink: "How the free class works",
    ctaLinkHref: "/en/free-trial-class",
    followInstagram: "Follow us on Instagram",
    club: "The club",
    where: "Find us",
    map: "View on Google Maps",
  },
} as const;

/** Enlaces del pie en inglés: páginas inglesas y, marcadas, las que siguen en español. */
export const enFooterNav = [
  { label: "Fencing for Kids", href: "/en/fencing-for-kids" },
  { label: "Fencing for Adults", href: "/en/fencing-for-adults" },
  { label: "Wheelchair Fencing", href: "/en/wheelchair-fencing" },
  { label: "Our Team", href: "/en/our-team" },
  { label: "Schedule and Prices", href: "/en/schedule-and-prices" },
  { label: "Free Trial Class", href: "/en/free-trial-class" },
  { label: "FAQ", href: "/en/faq" },
  { label: "Contact", href: "/en/contact" },
  { label: "Facilities and gallery (in Spanish)", href: "/instalaciones" },
  { label: "News (in Spanish)", href: "/noticias" },
  { label: "Calendar (in Spanish)", href: "/calendario" },
  { label: "Shop (in Spanish)", href: "/tienda" },
] as const;

export const enFooterLegal = [
  { label: "Privacy Policy (in Spanish)", href: "/politica-de-privacidad" },
  { label: "Legal Notice (in Spanish)", href: "/aviso-legal" },
  { label: "Cookie Policy (in Spanish)", href: "/politica-de-cookies-ue" },
] as const;
