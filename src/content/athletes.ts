export type Athlete = {
  name: string;
  achievement: string;
  photo?: string;
};

// Deportistas destacados del club. Vacío por ahora — se rellena según
// vayamos incorporando fotos y palmarés reales de cada uno. La sección
// "Nuestros Deportistas" ya está lista para pintar estas tarjetas en
// cuanto haya entradas aquí.
export const athletes: Athlete[] = [];
