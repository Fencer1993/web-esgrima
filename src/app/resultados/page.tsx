import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { pageText } from "@/content/texts";
import { Section } from "@/components/Section";
import { TournamentCard } from "@/components/TournamentCard";
import { TournamentList } from "@/components/TournamentList";
import { allTournaments, levels, totalMedals, type Medal } from "@/content/results";

export const metadata: Metadata = {
  title: "Resultados y palmarés",
  description:
    "Resultados de los torneos en los que compite el Club de Esgrima Torremolinos y medallas de nuestros tiradores, por temporada.",
  alternates: { canonical: "/resultados" },
};

const medalRows: [Medal, string][] = [
  ["oro", "Oros"],
  ["plata", "Platas"],
  ["bronce", "Bronces"],
];

export default function Resultados() {
  const hero = pageText("/resultados");
  const usedLevels = levels.filter((l) => allTournaments.some((t) => t.level === l));
  const seasonNames = [...new Set(allTournaments.map((t) => t.season))];
  const seasons = seasonNames.map((season) => ({
    season,
    entries: allTournaments
      .filter((t) => t.season === season)
      .map((t) => ({ level: t.level as string, node: <TournamentCard tournament={t} /> })),
  }));

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} lede={hero.lede} path="/resultados" />

      {allTournaments.length === 0 ? (
        <Section>
          <div className="mx-auto max-w-xl rounded-sm border border-dashed border-line bg-paper-raised px-6 py-10 text-center">
            <p className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
              Próximamente
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Muy pronto publicaremos aquí los resultados de nuestros tiradores: torneos,
              clasificaciones y medallas. Vuelve pronto.
            </p>
          </div>
        </Section>
      ) : (
        <>
          <section className="bg-ink text-paper">
            <dl className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-5 py-8 sm:py-10">
              {medalRows.map(([m, label]) => (
                <div key={m} className="border-l-2 border-accent pl-4">
                  <dt className="font-mono text-xs uppercase tracking-wide text-paper/70">
                    {label}
                  </dt>
                  <dd className="font-display text-4xl font-bold tabular sm:text-5xl">
                    {totalMedals[m]}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <Section>
            <TournamentList levels={usedLevels} seasons={seasons} />
          </Section>
        </>
      )}
    </>
  );
}
