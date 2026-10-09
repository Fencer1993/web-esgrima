import data from "./data/calendario.generated.json";

// Calendario público generado en el build desde SportMember
// (.github/scripts/sportmember-sync.mjs). Solo campos públicos.
export type CalendarType = "Entrenamiento" | "Competición" | "Evento";

export type CalendarItem = {
  id: string;
  title: string;
  start: string;
  end: string | null;
  location: string;
  team: string;
  type: CalendarType;
};

export const calendarUpdatedAt: string | null = data.updatedAt;

// Solo eventos futuros (o aún en curso) respecto al momento del build.
export function upcomingEvents(now: Date = new Date()): CalendarItem[] {
  return (data.items as CalendarItem[])
    .filter((i) => new Date(i.end ?? i.start).getTime() >= now.getTime())
    .sort((a, b) => a.start.localeCompare(b.start));
}
