export const site = {
  name: "Club de Esgrima Torremolinos",
  shortName: "Esgrima Torremolinos",
  domain: "esgrimatorremolinos.com",
  legal: {
    entityName: "Club de Esgrima Torremolinos",
    cif: "G44658458",
    legalForm: "Asociación deportiva sin ánimo de lucro (club deportivo)",
    representative: "Carlos Soler Márquez",
    representativeDni: "25710994F",
    representativeRole: "Presidente",
    // Nº de inscripción en el Registro Andaluz de Entidades Deportivas:
    // pendiente de que el club lo facilite.
  },
  url: "https://www.esgrimatorremolinos.com",
  description:
    "Club de esgrima en Torremolinos (Málaga). Clases de esgrima para niños desde 6 años, adolescentes, adultos y esgrima adaptada en silla de ruedas. Primera clase gratis.",
  address: {
    line: "C. Pedro Navarro Bruna, 1",
    postalCode: "29620",
    city: "Torremolinos",
    region: "Málaga",
    country: "ES",
    venue: "Palacio de Deportes San Miguel de Torremolinos",
    mapsUrl: "https://goo.gl/maps/G2eApSrD7TEqqLud8",
  },
  contact: {
    phone: "+34 616 94 00 91",
    phoneDial: "+34616940091",
    whatsapp: "34616940091",
    email: "esgrimatorremolinos@gmail.com",
  },
  social: {
    instagram: "https://www.instagram.com/esgrimatorremolinos/",
  },
} as const;

export const navigation = [
  { label: "Inicio", href: "/" },
  { label: "Esgrima para Niños", href: "/esgrima-ninos" },
  { label: "Esgrima para Adultos", href: "/esgrima-para-adultos" },
  { label: "Esgrima en Silla de Ruedas", href: "/esgrima-en-silla-de-ruedas" },
  { label: "Nuestro Equipo", href: "/nuestro-equipo" },
  { label: "Horarios y Precios", href: "/horarios-y-precios" },
  { label: "Instalaciones", href: "/instalaciones" },
  { label: "Preguntas Frecuentes", href: "/preguntas-frecuentes" },
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
