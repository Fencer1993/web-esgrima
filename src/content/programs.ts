export type Program = {
  slug: "esgrima-ninos" | "esgrima-para-adultos" | "esgrima-en-silla-de-ruedas";
  title: string;
  tagline: string;
  ageRange: string;
  schedule: string;
  // Fragmento del nombre de una foto de content/gallery.ts
  photo: string;
};

export const programs: Program[] = [
  {
    slug: "esgrima-ninos",
    title: "Esgrima para Niños",
    tagline: "Para niños de 6 a 12 años que quieren jugar, moverse y sentirse esgrimistas de verdad.",
    ageRange: "6–12 años",
    schedule: "Martes, miércoles y jueves de 18:30 a 19:30 (viernes, solo con autorización y supervisión de un adulto)",
    photo: "equipo-infantil-juvenil-esgrima-torremolinos-almeria",
  },
  {
    slug: "esgrima-para-adultos",
    title: "Esgrima para Adultos",
    tagline: "Para adolescentes desde 13 años y adultos con ganas de probar algo distinto.",
    ageRange: "Desde 13 años",
    schedule: "Martes, miércoles, jueves y viernes de 19:30 a 21:00",
    photo: "grupo-esgrimistas-club-torremolinos-sala-ayuntamiento",
  },
  {
    slug: "esgrima-en-silla-de-ruedas",
    title: "Esgrima en Silla de Ruedas",
    tagline: "Clases para la diversidad funcional. Un deporte inclusivo con toda la emoción del asalto.",
    ageRange: "Todas las edades",
    schedule: "Lunes, martes, miércoles y jueves de 10:00 a 12:30",
    photo: "podio-esgrima-adaptada-torneo-jaen",
  },
];

export const values: {
  icon: "companerismo" | "aprendizaje" | "inclusion";
  title: string;
  body: string;
}[] = [
  {
    icon: "companerismo",
    title: "Compañerismo",
    body: "La esgrima es un deporte individual, pero en la sala somos un equipo. Nadie gana ni pierde solo, y siempre hay alguien que te echa una mano.",
  },
  {
    icon: "aprendizaje",
    title: "Aprendizaje guiado",
    body: 'Tus profesores te acompañan desde la primera clase hasta la alta competición. Aquí no basta con coger el palito y decir "touché": se aprende, se suda la camiseta y se disfruta.',
  },
  {
    icon: "inclusion",
    title: "Inclusión",
    body: "Practicamos esgrima desde los 6 años e incluimos esgrima en silla de ruedas. Aquí hay sitio para todos, sin importar la edad ni la condición física previa.",
  },
];

export const coaches = [
  {
    name: "Carlos Soler",
    role: "Presidente y Entrenador de Esgrima Adaptada",
    bio: "Esgrimista paralímpico, con participación en Pekín y Barcelona. Seleccionador nacional de esgrima en silla de ruedas y encargado del grupo infantil.",
    phone: "+34 616 94 00 91",
    email: "csolerm@hotmail.com",
    photo: {
      src: "/images/equipo/carlos-soler-entrenador-esgrima-torremolinos.webp",
      alt: "Carlos Soler, presidente y entrenador de esgrima adaptada del Club de Esgrima Torremolinos",
      width: 411,
      height: 602,
    },
  },
  {
    name: "Víctor Santiago",
    role: "Director Técnico de Esgrima y Secretario",
    bio: "18 años haciendo esgrima, con varias participaciones internacionales. Ha sido entrenador de sable en una concentración internacional en China. Competidor activo y entrenador del grupo de adolescentes y adultos.",
    phone: "+34 687 34 02 77",
    email: "vst@hotmail.es",
    photo: {
      src: "/images/equipo/victor-santiago-entrenador-esgrima-torremolinos.webp",
      alt: "Víctor Santiago, director técnico y entrenador de esgrima del Club de Esgrima Torremolinos, con careta y sable en la sala del club",
      width: 520,
      height: 650,
    },
  },
];
