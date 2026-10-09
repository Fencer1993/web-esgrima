export type GalleryCategory = "Entrenamientos" | "Competiciones";

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
    caption: "Los más pequeños compiten mientras las familias les animan desde la grada.",
    category: "Competiciones",
    src: dir + "competicion-infantil-esgrima-torremolinos-grada.webp",
    width: 1200,
    height: 675,
    alt: "Pabellón con varias pistas de esgrima, niños compitiendo y familias en la grada, una con la camiseta del club",
  },
  {
    caption: "Asalto de entrenamiento en la sala del club.",
    category: "Entrenamientos",
    src: dir + "entrenamiento-asalto-sala-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Dos esgrimistas de sable en un asalto de entrenamiento en la sala del club",
  },
  {
    caption: "Asalto juvenil en una competición, con el árbitro de la pista.",
    category: "Competiciones",
    src: dir + "competicion-esgrima-juvenil-arbitro.webp",
    width: 554,
    height: 1200,
    alt: "Dos jóvenes esgrimistas compitiendo en un pabellón con el árbitro junto a la pista",
  },
  {
    caption: "Entrenamiento del grupo de esgrima en silla de ruedas y a pie, en la sala del club.",
    category: "Entrenamientos",
    src: dir + "entrenamiento-esgrima-silla-de-ruedas-torremolinos-grupo.webp",
    width: 1200,
    height: 540,
    alt: "Grupo de esgrimistas con careta y un deportista en silla de ruedas durante un entrenamiento en la sala del club",
  },
  {
    caption: "Podio masculino en el torneo de Jaén, con esgrimistas del club.",
    category: "Competiciones",
    src: dir + "podio-masculino-torneo-jaen-esgrima-torremolinos.webp",
    width: 1200,
    height: 540,
    alt: "Podio de cuatro esgrimistas con medallas en un torneo en Jaén, varios con la equipación del club",
  },
  {
    caption: "Parte del equipo del club antes de competir.",
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
    caption: "Podio femenino en el torneo de Jaén.",
    category: "Competiciones",
    src: dir + "podio-femenino-torneo-jaen-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Cuatro esgrimistas con medallas y trofeo en un podio de torneo en Jaén",
  },
  {
    caption: "Entrenamiento infantil: aprender a tirar jugando.",
    category: "Entrenamientos",
    src: dir + "entrenamiento-infantil-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Dos niños practicando esgrima con careta frente a los espejos de la sala del club",
  },
  {
    caption: "Podio de veteranos en el torneo de Jaén: oro para el club.",
    category: "Competiciones",
    src: dir + "podio-veteranos-torneo-jaen-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Podio con cuatro esgrimistas veteranos, el ganador levantando un trofeo, en un torneo en Jaén",
  },
  {
    caption: "Podio juvenil en el torneo de Jaén.",
    category: "Competiciones",
    src: dir + "podio-juvenil-torneo-jaen-esgrima-torremolinos.webp",
    width: 900,
    height: 1200,
    alt: "Tres jóvenes esgrimistas con medallas en un podio de torneo en Jaén",
  },
  {
    caption: "Asalto en la competición de Roquetas de Mar.",
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
    caption: "Podio de la última competición antes del verano. Ganador Bruno.",
    category: "Competiciones",
    src: dir + "podio-competicion-esgrima-torremolinos.webp",
    width: 554,
    height: 1200,
    alt: "Esgrimistas formados en pista al terminar una competición de esgrima en Torremolinos",
  },
  {
    caption: "Un día más entrenando en el Club de Esgrima Torremolinos.",
    category: "Entrenamientos",
    src: dir + "entrenamiento-club-esgrima-torremolinos.webp",
    width: 554,
    height: 1200,
    alt: "Entrenamiento de esgrima en la sala del Club de Esgrima Torremolinos",
  },
  {
    caption: "Asalto entre Rocío y Pablo.",
    category: "Entrenamientos",
    src: dir + "asalto-entrenamiento-esgrima-torremolinos.webp",
    width: 554,
    height: 1200,
    alt: "Dos esgrimistas disputando un asalto de entrenamiento en Torremolinos",
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
    caption: "Podio del torneo amistoso de Semana Santa 2022. Ganador Jack.",
    category: "Competiciones",
    src: dir + "podio-torneo-semana-santa-2022.webp",
    width: 1200,
    height: 554,
    alt: "Podio del torneo amistoso de esgrima de Semana Santa 2022 en Torremolinos",
  },
  {
    caption: "En el fragor de la competición.",
    category: "Competiciones",
    src: dir + "competicion-esgrima-torremolinos.webp",
    width: 554,
    height: 1200,
    alt: "Esgrimistas del club compitiendo en una pista de esgrima",
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
];
