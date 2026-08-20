export type GalleryCategory = "Entrenamientos" | "Competiciones";

export type GalleryItem = {
  caption: string;
  category: GalleryCategory;
};

export const galleryItems: GalleryItem[] = [
  {
    caption: "Miguel, Bruno y Ramiro en la II Copa Andaluza de 2022. Bruno gana el torneo M20 y Ramiro obtiene el bronce.",
    category: "Competiciones",
  },
  { caption: "Podio de la última competición antes del verano. Ganador Bruno.", category: "Competiciones" },
  { caption: "Un día más entrenando en el Club de Esgrima Torremolinos.", category: "Entrenamientos" },
  { caption: "Asalto entre Rocío y Pablo.", category: "Entrenamientos" },
  {
    caption: "Edu y Víctor entrenando antes de la II Copa Quijote en San Lorenzo del Escorial, 2022.",
    category: "Entrenamientos",
  },
  { caption: "Podio del torneo amistoso de Semana Santa 2022. Ganador Jack.", category: "Competiciones" },
  { caption: "En el fragor de la competición.", category: "Competiciones" },
  { caption: "Víctor en la final del I Torneo del Circuito Quijote 2022.", category: "Competiciones" },
  {
    caption: "Mario y David debutando con su entrenador en la última prueba Quijote de la temporada.",
    category: "Competiciones",
  },
];
