export type Program = {
  slug: "esgrima-ninos" | "esgrima-para-adultos" | "esgrima-en-silla-de-ruedas";
  title: string;
  tagline: string;
  ageRange: string;
  schedule: string;
};

export const programs: Program[] = [
  {
    slug: "esgrima-ninos",
    title: "Esgrima para Niños",
    tagline: "Grupo para menores entre 6 y 12 años. Deporte lúdico.",
    ageRange: "6–12 años",
    schedule: "Lunes, martes, miércoles y jueves de 18:30 a 19:30",
  },
  {
    slug: "esgrima-para-adultos",
    title: "Esgrima para Adultos",
    tagline: "Destinado a adolescentes desde 13 años y adultos.",
    ageRange: "Desde 13 años",
    schedule: "Lunes, martes, miércoles y jueves de 19:30 a 21:00",
  },
  {
    slug: "esgrima-en-silla-de-ruedas",
    title: "Esgrima en Silla de Ruedas",
    tagline: "Clases para la diversidad funcional. Deporte inclusivo.",
    ageRange: "Todas las edades",
    schedule: "Lunes, martes, miércoles y jueves de 10:00 a 12:30",
  },
];

export const values = [
  {
    title: "Compañerismo",
    body: "La esgrima es un deporte individual, pero en esencia somos un equipo. Nadie pierde ni gana solo, nos apoyamos mutuamente.",
  },
  {
    title: "Aprendizaje guiado",
    body: 'Nuestros profesores te guían desde el inicio hasta la alta competición. No es solo "coger el palito" y hacer "touché", vas a sudar un poco más la camiseta.',
  },
  {
    title: "Inclusión",
    body: "Practicamos esgrima desde los 6 años, e incluimos Esgrima en Silla de Ruedas. Aquí hay esgrima para todos, sin importar edad o condición física previa.",
  },
];

export const coaches = [
  {
    name: "Carlos Soler",
    role: "Presidente y Entrenador de Esgrima Adaptada",
    bio: "Esgrimista paralímpico, con participación en Pekín y Barcelona. Seleccionador nacional de esgrima en silla de ruedas y encargado del grupo infantil.",
    phone: "+34 616 94 00 91",
    email: "csolerm@hotmail.com",
  },
  {
    name: "Víctor Santiago",
    role: "Director Técnico de Esgrima y Secretario",
    bio: "Esgrimista del club durante 15 años, con varias participaciones internacionales y 6 años de experiencia como entrenador. Competidor activo y entrenador del grupo de adolescentes y adultos.",
    phone: "+34 687 34 02 77",
    email: "vst@hotmail.es",
  },
];
