// Lógica de la reserva de clase gratis: sesiones disponibles, fechas y
// calendario (.ics / Google Calendar). Todo se calcula en la zona horaria del
// club (Europe/Madrid), sin importar dónde esté el navegador.

export type ReservaGroup = {
  id: string;
  name: string;
  weekdays: number[]; // 1 = lunes … 7 = domingo
  start: string; // HH:MM
  end: string;
  capacity: number;
  minAge: string;
  minAgeYears: number;
  maxAgeYears?: number;
  ageRequired: boolean;
};

export type ReservaConfig = {
  weeksAhead: number;
  minNoticeHours: number;
  notes: string[];
  blockedDates: { date: string; reason: string }[];
  groups: ReservaGroup[];
};

export type SessionState = "open" | "full" | "blocked" | "closed";

export type Session = {
  key: string; // AAAA-MM-DD|grupo
  date: string;
  group: ReservaGroup;
  state: SessionState;
  reason?: string;
  left: number | null; // null = no sabemos (sin conexión)
};

const TZ = "Europe/Madrid";
const DAY = 86400000;

const pad = (n: number) => String(n).padStart(2, "0");

/** Fecha y hora actuales en Madrid, como "reloj de pared" en milisegundos UTC. */
export function madridNow(now: Date = new Date()): { date: string; wall: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const y = get("year");
  const m = get("month");
  const d = get("day");
  return {
    date: `${y}-${pad(m)}-${pad(d)}`,
    wall: Date.UTC(y, m - 1, d, get("hour"), get("minute")),
  };
}

function parseDate(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function isoWeekday(ms: number): number {
  const d = new Date(ms).getUTCDay();
  return d === 0 ? 7 : d;
}

export function formatDateLong(date: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(parseDate(date)));
}

export function formatDateShort(date: string): { weekday: string; day: string; month: string } {
  const dt = new Date(parseDate(date));
  const f = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es-ES", { timeZone: "UTC", ...o }).format(dt);
  return {
    weekday: f({ weekday: "short" }).replace(".", ""),
    day: f({ day: "numeric" }),
    month: f({ month: "short" }).replace(".", ""),
  };
}

/** Sesiones reservables de un grupo en las próximas semanas. */
export function buildSessions(
  cfg: ReservaConfig,
  group: ReservaGroup,
  booked: Record<string, number> | null,
  now: Date = new Date(),
): Session[] {
  const today = madridNow(now);
  const todayMs = parseDate(today.date);
  const blocked = new Map(cfg.blockedDates.map((b) => [b.date, b.reason]));
  const out: Session[] = [];
  for (let i = 0; i <= cfg.weeksAhead * 7; i++) {
    const ms = todayMs + i * DAY;
    if (!group.weekdays.includes(isoWeekday(ms))) continue;
    const d = new Date(ms);
    const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    const [hh, mm] = group.start.split(":").map(Number);
    const startWall = ms + (hh * 60 + mm) * 60000;
    if (startWall < today.wall + cfg.minNoticeHours * 3600000) {
      // Ya no se puede reservar (pasada o sin antelación suficiente): no se muestra.
      continue;
    }
    const key = `${date}|${group.id}`;
    const taken = booked ? (booked[key] ?? 0) : null;
    const left = taken === null ? null : Math.max(0, group.capacity - taken);
    const reason = blocked.get(date);
    let state: SessionState = "open";
    if (reason !== undefined) state = "blocked";
    else if (left === 0) state = "full";
    out.push({ key, date, group, state, reason, left });
  }
  return out;
}

// --- Calendario ------------------------------------------------------------

const compact = (date: string, time: string) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;

const icsEscape = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

function foldLine(line: string): string {
  // RFC 5545: líneas de 75 octetos como máximo; se parte por caracteres (aprox.).
  const out: string[] = [];
  let rest = line;
  while (rest.length > 70) {
    out.push(rest.slice(0, 70));
    rest = " " + rest.slice(70);
  }
  out.push(rest);
  return out.join("\r\n");
}

export type CalendarEvent = {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  location: string;
  description: string;
};

export function buildIcs(ev: CalendarEvent): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Club de Esgrima Torremolinos//Clase gratis//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Madrid",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:clase-gratis-${ev.id}@esgrimatorremolinos.com`,
    `DTSTAMP:${stamp}Z`,
    `DTSTART;TZID=Europe/Madrid:${compact(ev.date, ev.start)}`,
    `DTEND;TZID=Europe/Madrid:${compact(ev.date, ev.end)}`,
    `SUMMARY:${icsEscape(ev.title)}`,
    `LOCATION:${icsEscape(ev.location)}`,
    `DESCRIPTION:${icsEscape(ev.description)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Clase gratis de esgrima",
    "TRIGGER:-PT2H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(ev: CalendarEvent): string {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${compact(ev.date, ev.start)}/${compact(ev.date, ev.end)}`,
    ctz: TZ,
    location: ev.location,
    details: ev.description,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
