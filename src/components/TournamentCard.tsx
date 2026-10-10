import Link from "next/link";
import { countMedals, formatDate, type Tournament } from "@/content/results";
import { MedalCounts } from "./MedalBadge";

export function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  const medals = countMedals(t.results);
  return (
    <article className="reveal group relative flex h-full flex-col rounded-sm border border-line bg-paper p-5 transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="rounded-sm bg-accent-soft px-2 py-1 font-mono uppercase tracking-[0.12em] text-accent-dark">
          {t.level}
        </span>
        <time dateTime={t.date} className="text-ink-faint">
          {formatDate(t.date)}
        </time>
      </div>
      <h3 className="mt-3 text-xl font-bold uppercase tracking-tight text-ink">
        <Link
          href={`/resultados/${t.slug}`}
          className="after:absolute after:inset-0 hover:text-accent-dark"
        >
          {t.name}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        {[t.city, t.weapon, t.category].filter(Boolean).join(" · ")}
      </p>
      <div className="mt-4 flex-1">
        <MedalCounts {...medals} />
      </div>
      <span className="mt-4 text-sm font-semibold uppercase tracking-wide text-accent-dark">
        Ver resultados
      </span>
    </article>
  );
}
