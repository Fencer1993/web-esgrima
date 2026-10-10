import Link from "next/link";
import { Section, SectionHeading } from "./Section";
import { MedalBadge } from "./MedalBadge";
import { formatDate, latestMedals } from "@/content/results";

// Últimas medallas del club. No pinta nada mientras no haya resultados.
export function LatestResults() {
  const latest = latestMedals(3);
  if (latest.length === 0) return null;
  return (
    <Section className="border-t border-line">
      <SectionHeading
        eyebrow="Resultados"
        title="Últimas medallas"
        lede="Lo último que han traído nuestros tiradores de los torneos."
      />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {latest.map(({ tournament: t, result: r }, i) => (
          <li
            key={i}
            className="rounded-sm border border-line bg-paper-raised p-5"
          >
            {r.medal && <MedalBadge medal={r.medal} />}
            <p className="mt-3 font-display text-xl font-bold uppercase tracking-tight text-ink">
              {r.athlete}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              <Link
                href={`/resultados/${t.slug}`}
                className="link-touche font-semibold text-accent-dark"
              >
                {t.name}
              </Link>
              {t.category ? ` · ${t.category}` : ""}
            </p>
            <p className="mt-1 text-xs text-ink-faint">{formatDate(t.date)}</p>
          </li>
        ))}
      </ul>
      <Link
        href="/resultados"
        className="link-touche mt-8 inline-block text-sm font-semibold uppercase tracking-wide text-accent-dark"
      >
        Ver todos los resultados →
      </Link>
    </Section>
  );
}
