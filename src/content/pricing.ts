import horarios from "./data/horarios.json";
import precios from "./data/precios.json";

// Editables desde el panel (/admin): src/content/data/horarios.json y
// src/content/data/precios.json.

// Acceso a tecnificación: lo decide el director técnico.
export const technificationNote = horarios.technificationNote;

// Grupos de tecnificación deportiva (lunes).
export const competitionGroups = horarios.competitionGroups;

// Servicio extra gratuito. Se concreta con la dirección técnica.
export const physicalTraining = horarios.physicalTraining;

export type ScheduleRow = { group: string; days: string; hours: string; note?: string };

export const schedule: ScheduleRow[] = [
  ...competitionGroups.map((g) => ({ group: g.name, days: g.days, hours: g.hours, note: technificationNote })),
  ...horarios.groups.map((g: ScheduleRow) => ({ ...g, note: g.note || undefined })),
  {
    group: `${physicalTraining.name} (${physicalTraining.price.toLowerCase()})`,
    days: physicalTraining.days,
    hours: physicalTraining.hours,
  },
];

export const plans = precios.plans;
export const bonos = precios.bonos;
export const federationFees = precios.federationFees;
