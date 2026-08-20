export const schedule = [
  {
    group: "Niños (6–12 años, avanzado)",
    days: "Lunes, martes, miércoles y jueves",
    hours: "18:30 – 19:30",
  },
  {
    group: "Adolescentes y Adultos",
    days: "Lunes, martes, miércoles y jueves",
    hours: "19:30 – 21:00",
  },
  {
    group: "Esgrima Ocio",
    days: "Viernes",
    hours: "20:00 – 22:00",
    note: "Solo para adultos, o menores bajo supervisión. Entrenamiento libre.",
  },
  {
    group: "Esgrima en Silla de Ruedas",
    days: "Lunes, martes, miércoles y jueves",
    hours: "10:00 – 12:30",
  },
];

export const plans = [
  {
    name: "Niños",
    price: "30€",
    period: "al mes",
    features: ["4 clases semanales", "Uso gratuito de material", "Posibilidad de competir"],
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
    price: "20€",
    period: "opcional",
    features: [
      "2 clases privadas mensuales",
      "Asesoramiento técnico-táctico",
      "Posibilidad de grabar la clase",
    ],
  },
];

export const bonos = [
  { name: "Bono 3 meses", price: "100€", childPrice: "75€ niños", note: "Ahorro de medio mes" },
  { name: "Bono 5 meses", price: "160€", childPrice: "120€ niños", note: "¡Un mes gratis!" },
];

export const federationFees = [
  { label: "Licencia D'Artagnan (5–8 años)", price: "15€" },
  { label: "Licencia menor 11–13 años", price: "25€" },
  { label: "Licencia menor de 14 y 15 años", price: "40€" },
  { label: "Licencia mayor de 15 años", price: "60€" },
];
