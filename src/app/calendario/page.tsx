import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { site } from "@/content/site";
import { upcomingEvents, type CalendarItem } from "@/content/calendar";

export const metadata: Metadata = {
  title: "Calendario de competiciones y eventos",
  description:
    "Próximas competiciones, torneos y eventos del Club de Esgrima Torremolinos: fechas, horarios y lugar.",
  alternates: { canonical: "/calendario" },
};

const TZ = "Europe/Madrid";
const fmt = (o: Intl.DateTimeFormatOptions, d: Date) =>
  new Intl.DateTimeFormat("es-ES", { timeZone: TZ, ...o }).format(d);

function monthKey(d: Date) {
  return fmt({ year: "numeric", month: "2-digit" }, d);
}

function timeRange(i: CalendarItem) {
  const t = (d: Date) => fmt({ hour: "2-digit", minute: "2-digit", hour12: false }, d);
  const s = new Date(i.start);
  return i.end ? `${t(s)} – ${t(new Date(i.end))}` : t(s);
}

const badge: Record<CalendarItem["type"], string> = {
  Competición: "bg-accent text-white",
  Evento: "bg-steel text-white",
  Entrenamiento: "bg-paper-raised text-ink-soft border border-line",
};

export default function Calendario() {
  const items = upcomingEvents();

  const groups: { key: string; label: string; items: CalendarItem[] }[] = [];
  for (const i of items) {
    const d = new Date(i.start);
    const key = monthKey(d);
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = {
        key,
        label: fmt({ month: "long", year: "numeric" }, d),
        items: [],
      };
      groups.push(g);
    }
    g.items.push(i);
  }

  const jsonLd = items
    .filter((i) => i.type !== "Entrenamiento")
    .map((i) => ({
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: i.title,
      startDate: i.start,
      ...(i.end ? { endDate: i.end } : {}),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: i.location || site.address.venue },
      organizer: { "@type": "SportsOrganization", name: site.name, url: site.url },
    }));

  return (
    <>
      <PageHero
        eyebrow="Agenda del club"
        title="Calendario"
        lede="Próximas competiciones, torneos y eventos del club."
        path="/calendario"
      />
      {jsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Section>
        {groups.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-sm border border-line bg-paper-raised p-8 text-center">
            <p className="font-display text-2xl font-bold uppercase tracking-tight">
              Muy pronto verás aquí las competiciones y eventos del club
            </p>
            <p className="mt-3 text-ink-soft">
              Mientras tanto, síguenos en Instagram o consulta los horarios de las clases.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-blade rounded-sm bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
              >
                Instagram
              </a>
              <Link
                href="/horarios-y-precios"
                className="rounded-sm border border-line px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-paper-raised"
              >
                Horarios y precios
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map((g) => (
              <section key={g.key} aria-labelledby={`m-${g.key}`}>
                <h2
                  id={`m-${g.key}`}
                  className="font-display text-2xl font-bold uppercase tracking-tight"
                >
                  {g.label}
                </h2>
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {g.items.map((i) => {
                    const d = new Date(i.start);
                    return (
                      <li key={i.id} className="flex gap-4 py-4 sm:gap-6">
                        <div className="w-16 shrink-0 rounded-sm bg-ink py-2 text-center text-paper">
                          <div className="font-display text-3xl font-bold leading-none tabular">
                            {fmt({ day: "numeric" }, d)}
                          </div>
                          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-paper/70">
                            {fmt({ weekday: "short" }, d).replace(".", "")}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${badge[i.type]}`}
                            >
                              {i.type}
                            </span>
                            {i.team && (
                              <span className="rounded-full bg-steel-soft px-2 py-0.5 text-xs text-ink-soft">
                                {i.team}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 text-lg font-bold">{i.title}</h3>
                          <p className="text-sm text-ink-soft tabular">
                            {timeRange(i)}
                            {i.location && ` · ${i.location}`}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
