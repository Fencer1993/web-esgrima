// Por lugar: la sala del club (tarima, armeros, espejos) o competiciones fuera.
export type GalleryCategory = "En nuestra sala" | "Competiciones";

export type GalleryItem = {
  caption: string;
  category: GalleryCategory;
  src: string;
  width: number;
  height: number;
  // Texto alternativo: describe lo que se ve (no repite el pie de foto).
  alt: string;
};

const dir = "/images/galeria/";

export const galleryItems: GalleryItem[] = [
  {
    caption: "¡Oro! Lo más alto del podio en el torneo de Jaén, con la copa en la mano.",
    category: "Competiciones",
    src: dir + "podio-absoluto-torneo-jaen-oro-torremolinos.webp",
    width: 1200,
    height: 900,
    alt: "Esgrimista del club en lo más alto del podio con la copa en un torneo en Jaén",
  },
  {
    caption: "Parte del equipo de adultos, listos para competir.",
    category: "Competiciones",
    src: dir + "esgrimistas-adultos-club-torremolinos-torneo.webp",
    width: 900,
    height: 1200,
    alt: "Seis esgrimistas adultos del club sonriendo juntos en un torneo",
  },
  {
    caption: "Dos de nuestras peques, medalla al cuello en el podio de Jaén.",
    category: "Competiciones",
    src: dir + "podio-infantil-torneo-jaen-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Dos niñas esgrimistas con su medalla sobre el podio de un torneo en Jaén",
  },
  {
    caption: "Calentamiento en grupo en nuestra sala: pequeños, mayores y entrenadores, todos a una.",
    category: "En nuestra sala",
    src: dir + "clase-grupal-esgrima-sala-club-torremolinos.webp",
    width: 1200,
    height: 675,
    alt: "Clase grupal de esgrima en la sala del club, con deportistas de distintas edades",
  },
  {
    caption: "Agua, un consejo rápido y de vuelta a la pista.",
    category: "Competiciones",
    src: dir + "esgrimistas-club-torremolinos-entre-asaltos.webp",
    width: 1200,
    height: 900,
    alt: "Un esgrimista adulto atiende a un joven esgrimista entre asaltos",
  },
  {
    caption: "Esgrima en silla de ruedas: el club se sube al podio en Zamora.",
    category: "Competiciones",
    src: dir + "podio-esgrima-silla-de-ruedas-zamora-torremolinos.webp",
    width: 1200,
    height: 675,
    alt: "Esgrimistas en silla de ruedas con trofeos en un podio en Zamora",
  },
  {
    caption: "El equipo infantil, uniformado y con ganas, antes de su competición.",
    category: "Competiciones",
    src: dir + "equipo-infantil-esgrima-torremolinos-competicion.webp",
    width: 1200,
    height: 903,
    alt: "Seis niños y niñas esgrimistas posando juntos en un pabellón antes de competir",
  },
  {
    caption: "Descanso entre asaltos: sonrisas y caretas a mano para la siguiente ronda.",
    category: "Competiciones",
    src: dir + "esgrimistas-infantiles-descanso-competicion-torremolinos.webp",
    width: 1024,
    height: 768,
    alt: "Niños y niñas esgrimistas sentados en la pista con sus caretas durante una competición",
  },
  {
    caption: "Competición de Navidad en la Caseta Fitness, con Antonio Marzal arbitrando el asalto.",
    category: "Competiciones",
    src: dir + "asalto-entrenamiento-pista-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Dos esgrimistas en un asalto de entrenamiento en una sala con espejos",
  },
  {
    caption: "Saludo de sables de todos los participantes en la competición de Navidad de la Caseta Fitness de Torremolinos.",
    category: "Competiciones",
    src: dir + "grupo-esgrimistas-club-torremolinos-sala-ayuntamiento.webp",
    width: 1200,
    height: 900,
    alt: "Grupo de esgrimistas de todas las edades haciendo el saludo con los sables en una sala de Torremolinos",
  },
  {
    caption: "Expedición a Almería: nuestro equipo infantil y juvenil con sus entrenadores.",
    category: "Competiciones",
    src: dir + "equipo-infantil-juvenil-esgrima-torremolinos-almeria.webp",
    width: 1024,
    height: 768,
    alt: "Grupo de jóvenes esgrimistas del club con sus entrenadores en una competición en Almería",
  },
  {
    caption: "Esgrima adaptada en Jaén: trofeos y medallas para nuestros tiradores en silla.",
    category: "Competiciones",
    src: dir + "podio-esgrima-adaptada-torneo-jaen-torremolinos.webp",
    width: 1200,
    height: 900,
    alt: "Esgrimistas en silla de ruedas con trofeos y medallas en el podio de un torneo en Jaén",
  },
  {
    caption: "Medalla al cuello y pulgar arriba: doble podio para el club en Jaén.",
    category: "Competiciones",
    src: dir + "medallistas-torneo-jaen-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Dos esgrimistas del club con medalla y el pulgar en alto en un torneo en Jaén",
  },
  {
    caption: "Los más pequeños en pista y las familias animando desde la grada.",
    category: "Competiciones",
    src: dir + "competicion-infantil-esgrima-torremolinos-grada.webp",
    width: 1200,
    height: 675,
    alt: "Pabellón con varias pistas de esgrima, niños compitiendo y familias en la grada, una con la camiseta del club",
  },
  {
    caption: "Competición de Navidad en la Caseta Fitness de Torremolinos: sable a plena velocidad.",
    category: "Competiciones",
    src: dir + "entrenamiento-asalto-sala-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Dos esgrimistas de sable en un asalto de entrenamiento en la sala del club",
  },
  {
    caption: "Asalto juvenil bajo la mirada del árbitro.",
    category: "Competiciones",
    src: dir + "competicion-esgrima-juvenil-arbitro.webp",
    width: 554,
    height: 1200,
    alt: "Dos jóvenes esgrimistas compitiendo en un pabellón con el árbitro junto a la pista",
  },
  {
    caption: "Esgrima inclusiva en nuestra sala: tiradores a pie y en silla entrenan juntos.",
    category: "En nuestra sala",
    src: dir + "entrenamiento-esgrima-silla-de-ruedas-torremolinos-grupo.webp",
    width: 1200,
    height: 540,
    alt: "Grupo de esgrimistas con careta y un deportista en silla de ruedas durante un entrenamiento en la sala del club",
  },
  {
    caption: "Antonio Garrido, tirador del club, en un asalto de esgrima en silla de ruedas en nuestra sala.",
    category: "En nuestra sala",
    src: dir + "esgrimista-silla-de-ruedas-competicion-torremolinos.webp",
    width: 554,
    height: 1200,
    alt: "Antonio Garrido, esgrimista en silla de ruedas del club, en un asalto en la sala del club",
  },
  {
    caption: "Podio en Jaén con la camiseta del club bien visible.",
    category: "Competiciones",
    src: dir + "podio-masculino-torneo-jaen-esgrima-torremolinos.webp",
    width: 1200,
    height: 540,
    alt: "Podio de cuatro esgrimistas con medallas en un torneo en Jaén, varios con la equipación del club",
  },
  {
    caption: "Buen ambiente antes de competir: así es el equipo.",
    category: "Competiciones",
    src: dir + "equipo-esgrimistas-club-torremolinos-competicion.webp",
    width: 1200,
    height: 900,
    alt: "Cuatro esgrimistas del club sonriendo juntos en un pabellón durante una competición",
  },
  {
    caption: "En plena estocada durante un asalto juvenil.",
    category: "Competiciones",
    src: dir + "asalto-juvenil-competicion-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Dos jóvenes esgrimistas en estocada durante una competición en un pabellón",
  },
  {
    caption: "Podio femenino en Jaén, con trofeo para el club.",
    category: "Competiciones",
    src: dir + "podio-femenino-torneo-jaen-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Cuatro esgrimistas con medallas y trofeo en un podio de torneo en Jaén",
  },
  {
    caption: "Primeros fondos en nuestra sala: aquí se aprende jugando.",
    category: "En nuestra sala",
    src: dir + "entrenamiento-infantil-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Dos niños practicando esgrima con careta frente a los espejos de la sala del club",
  },
  {
    caption: "Veteranos en Jaén: el oro viaja a Torremolinos.",
    category: "Competiciones",
    src: dir + "podio-veteranos-torneo-jaen-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Podio con cuatro esgrimistas veteranos, el ganador levantando un trofeo, en un torneo en Jaén",
  },
  {
    caption: "Podio juvenil en Jaén: la cantera también suma medallas.",
    category: "Competiciones",
    src: dir + "podio-juvenil-torneo-jaen-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Tres jóvenes esgrimistas con medallas en un podio de torneo en Jaén",
  },
  {
    caption: "Roquetas de Mar: ataque a fondo en pleno asalto.",
    category: "Competiciones",
    src: dir + "asalto-competicion-roquetas-de-mar-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Dos esgrimistas de sable en pleno asalto en una competición en Roquetas de Mar",
  },
  {
    caption: "Miguel, Bruno y Ramiro en la II Copa Andaluza de 2022. Bruno gana el torneo M20 y Ramiro obtiene el bronce.",
    category: "Competiciones",
    src: dir + "copa-andaluza-2022-podio-m20-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Tres esgrimistas del Club de Esgrima Torremolinos con la copa y la medalla de bronce de la II Copa Andaluza 2022",
  },
  {
    caption: "Competición del Ayuntamiento en nuestra sala, la última antes del verano. Ganador Bruno.",
    category: "En nuestra sala",
    src: dir + "podio-competicion-esgrima-torremolinos.webp",
    width: 554,
    height: 1200,
    alt: "Esgrimistas formados en pista al terminar una competición de esgrima en Torremolinos",
  },
  {
    caption: "Edu y Víctor entrenando antes de la II Copa Quijote en San Lorenzo del Escorial, 2022.",
    category: "Competiciones",
    src: dir + "entrenamiento-previo-copa-quijote-2022.webp",
    width: 554,
    height: 1200,
    alt: "Dos esgrimistas calentando sobre la pista antes de la II Copa Quijote de 2022",
  },
  {
    caption: "Podio de la competición del Ayuntamiento de mayo de 2022 en nuestra sala. Ganador Jack.",
    category: "En nuestra sala",
    src: dir + "podio-torneo-semana-santa-2022.webp",
    width: 1200,
    height: 554,
    alt: "Podio del torneo amistoso de esgrima de Semana Santa 2022 en Torremolinos",
  },
  {
    caption: "Víctor en la final del I Torneo del Circuito Quijote 2022.",
    category: "Competiciones",
    src: dir + "final-torneo-circuito-quijote-2022.webp",
    width: 1200,
    height: 900,
    alt: "Víctor Santiago en plena estocada durante la final del I Torneo del Circuito Quijote 2022",
  },
  {
    caption: "Mario y David debutando con su entrenador en la última prueba Quijote de la temporada.",
    category: "Competiciones",
    src: dir + "debut-prueba-quijote-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Dos esgrimistas jóvenes con su entrenador en su debut en la prueba Quijote",
  },
  {
    caption: "El armero de nuestra sala: sables y caretas listos para la próxima clase.",
    category: "En nuestra sala",
    src: dir + "armero-sala-club-esgrima-torremolinos.webp",
    width: 600,
    height: 560,
    alt: "Armero de madera con sables y caretas de esgrima colgados en la sala del club",
  },
];

// Busca una foto de la galería por un fragmento de su nombre de archivo.
export function galleryPhoto(name: string): GalleryItem {
  const item = galleryItems.find((g) => g.src.includes(name));
  if (!item) throw new Error(`Foto no encontrada en gallery.ts: ${name}`);
  return item;
}
