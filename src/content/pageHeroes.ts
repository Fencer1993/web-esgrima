// Foto de fondo de la cabecera de cada página interior (fragmento del nombre
// de archivo en gallery.ts). Las páginas sin entrada (legales) no llevan foto.
export const pageHeroes: Record<string, { photo: string; position?: string }> = {
  "/esgrima-ninos": {
    photo: "esgrimistas-infantiles-descanso-competicion-torremolinos",
    position: "object-[center_40%]",
  },
  "/esgrima-para-adultos": {
    photo: "asalto-competicion-roquetas-de-mar-esgrima-torremolinos",
    position: "object-[center_30%]",
  },
  "/esgrima-en-silla-de-ruedas": {
    photo: "podio-esgrima-silla-de-ruedas-zamora",
    position: "object-center",
  },
  "/nuestro-equipo": {
    photo: "esgrimistas-club-torremolinos-entre-asaltos",
    position: "object-[center_35%]",
  },
  "/horarios-y-precios": {
    photo: "equipo-infantil-juvenil-esgrima-torremolinos-almeria",
    position: "object-[center_55%]",
  },
  "/instalaciones": {
    photo: "clase-grupal-esgrima-sala-club-torremolinos",
    position: "object-center",
  },
  "/clase-gratis": {
    photo: "competicion-infantil-esgrima-torremolinos-grada",
    position: "object-center",
  },
  "/preguntas-frecuentes": {
    photo: "armero-sala-club-esgrima-torremolinos",
    position: "object-[center_25%]",
  },
  "/contacto": {
    photo: "medallistas-torneo-jaen-esgrima-torremolinos",
    position: "object-[center_30%]",
  },
};
