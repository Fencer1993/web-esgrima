import club from "./data/club.json";

// Datos del club editables desde el panel (/admin): src/content/data/club.json.
export const site = club;

export const navigation = [
  { label: "Inicio", href: "/" },
  { label: "Esgrima para Niños", href: "/esgrima-ninos" },
  { label: "Esgrima para Adultos", href: "/esgrima-para-adultos" },
  { label: "Esgrima en Silla de Ruedas", href: "/esgrima-en-silla-de-ruedas" },
  { label: "Nuestro Equipo", href: "/nuestro-equipo" },
  { label: "Horarios y Precios", href: "/horarios-y-precios" },
  { label: "Instalaciones", href: "/instalaciones" },
  { label: "Noticias", href: "/noticias" },
  { label: "Calendario", href: "/calendario" },
  { label: "Tienda", href: "/tienda" },
  { label: "Preguntas Frecuentes", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "/contacto" },
] as const;

// Menú principal agrupado (cabecera). `navigation` sigue siendo la lista
// plana que usan el pie de página y llms.txt.
export const navMenu = [
  {
    label: "Clases",
    items: [
      { label: "Niños", href: "/esgrima-ninos", description: "Desde 6 años, aprendiendo jugando" },
      { label: "Adultos", href: "/esgrima-para-adultos", description: "Ocio o competición, tú eliges" },
      { label: "Silla de ruedas", href: "/esgrima-en-silla-de-ruedas", description: "Esgrima adaptada con la mejor dirección" },
      { label: "Tecnificación", href: "/horarios-y-precios#tecnificacion", description: "Grupos de competición los lunes" },
    ],
  },
  {
    label: "El club",
    items: [
      { label: "Nuestro equipo", href: "/nuestro-equipo", description: "Entrenadores y deportistas" },
      { label: "Instalaciones", href: "/instalaciones", description: "Dónde entrenamos y galería" },
      { label: "Noticias y avisos", href: "/noticias", description: "Tablón de anuncios del club" },
      { label: "Calendario", href: "/calendario", description: "Competiciones y eventos" },
      { label: "Tienda", href: "/tienda", description: "Material con descuento de club" },
      { label: "Preguntas frecuentes", href: "/preguntas-frecuentes", description: "Material, edades, seguro y más" },
    ],
  },
] as const;

export const navLinks = [
  { label: "Horarios y precios", href: "/horarios-y-precios" },
  { label: "Contacto", href: "/contacto" },
] as const;

export const footerLinks = [
  { label: "Política de Privacidad", href: "/politica-de-privacidad" },
  { label: "Aviso Legal", href: "/aviso-legal" },
  { label: "Política de Cookies", href: "/politica-de-cookies-ue" },
] as const;

export function whatsappLink(message: string) {
  return `https://api.whatsapp.com/send?phone=${site.contact.whatsapp}&text=${encodeURIComponent(message)}`;
}
