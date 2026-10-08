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
