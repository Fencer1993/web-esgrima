const weekdays = "Martes, miércoles, jueves y viernes";

// Grupos de tecnificación deportiva: preparan la competición y entrenan los
// lunes con el equipo técnico del club.
// Acceso a tecnificación: lo decide el director técnico.
export const technificationNote =
  "El acceso a este grupo requiere una evaluación previa del director técnico.";

export const competitionGroups = [
  {
    name: "Tecnificación · 13 a 18 años",
    days: "Lunes",
    hours: "18:00 – 20:00",
    text: "Para adolescentes que quieren competir: técnica, táctica y preparación de torneos en una sesión específica.",
  },
  {
    name: "Tecnificación · mayores de 18",
    days: "Lunes",
    hours: "20:00 – 22:00",
    text: "Para adultos que compiten o quieren empezar a hacerlo: asaltos de nivel, trabajo táctico y plan de competición.",
  },
];

// Servicio extra gratuito. Se concreta con la dirección técnica.
export const physicalTraining = {
  name: "Entrenamiento físico deportivo",
  price: "Gratis",
  days: "Martes y jueves",
  hours: "18:30 – 19:30",
  text: "Servicio extra sin coste para los deportistas del club. Consulta plazas y condiciones con la dirección técnica.",
};

export const schedule: { group: string; days: string; hours: string; note?: string }[] = [
  ...competitionGroups.map((g) => ({ group: g.name, days: g.days, hours: g.hours, note: technificationNote })),
  {
    group: "Niños (6–12 años)",
    days: "Martes, miércoles y jueves",
    hours: "18:30 – 19:30",
    note: "Los viernes, solo con autorización y supervisión de un adulto.",
  },
  { group: "Adolescentes y Adultos", days: weekdays, hours: "19:30 – 21:00" },
  { group: "Esgrima en Silla de Ruedas", days: "Lunes, martes, miércoles y jueves", hours: "10:00 – 12:30" },
  {
    group: "Entrenamiento físico deportivo (gratis)",
    days: physicalTraining.days,
    hours: physicalTraining.hours,
  },
];

export const plans = [
  {
    name: "Niños",
    price: "30€",
    period: "al mes",
    features: ["3 clases semanales", "Uso gratuito de material", "Posibilidad de competir"],
  },
  {
    name: "Adultos",
    price: "40€",
    period: "al mes",
    features: [
      "4 clases semanales",
      "Uso gratuito de material",
      "Esgrima Ocio",
      "Posibilidad de competir",
      "Clases individuales",
    ],
  },
  {
    name: "Clases privadas",
    price: "Desde 20€",
    period: "por clase",
    features: [
      "Clase suelta de 30 minutos: 20€",
      "Clase de 1 hora completa: 30€",
      "Día y hora a convenir con el profesor",
      "Asesoramiento técnico-táctico",
      "Posibilidad de grabar la clase",
    ],
  },
];

export const bonos = [
  { name: "Bono 3 meses", price: "100€", childPrice: "75€ niños", note: "Te ahorras media mensualidad" },
  { name: "Bono 5 meses", price: "160€", childPrice: "120€ niños", note: "Te ahorras una mensualidad completa" },
];

export const federationFees = [
  { label: "Licencia D'Artagnan (5–8 años)", price: "15€" },
  { label: "Licencia menor 11–13 años", price: "25€" },
  { label: "Licencia menor de 14 y 15 años", price: "40€" },
  { label: "Licencia mayor de 15 años", price: "60€" },
];
