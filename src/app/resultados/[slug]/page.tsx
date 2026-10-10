import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { MedalBadge } from "@/components/MedalBadge";
import { allTournaments, formatDate, tournamentBySlug } from "@/content/results";
import { athletesWithPage } from "@/content/athletePages";
import { slugify } from "@/content/athletes";
import { site } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  // Con "output: export" Next exige al menos una ruta: si aún no hay datos se
  // genera un marcador que la página resuelve con notFound() (404).
  const params = allTournaments.map((t) => ({ slug: t.slug }));
  return params.length > 0 ? params : [{ slug: "_" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = tournamentBySlug(slug);
  if (!t) return {};
  return {
    title: t.name,
    description:
      t.summary ??
      `Resultados del ${t.name} (${formatDate(t.date)}${t.city ? `, ${t.city}` : ""}) con los tiradores del Club de Esgrima Torremolinos.`,
    alternates: { canonical: `/resultados/${t.slug}` },
  };
}

export default async function Torneo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = tournamentBySlug(slug);
  if (!t) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: t.name,
    startDate: t.date,
    sport: `Esgrima (${t.weapon})`,
    inLanguage: "es",
    ...(t.summary ? { description: t.summary } : {}),
    ...(t.city
      ? { location: { "@type": "Place", name: t.city, address: { "@type": "PostalAddress", addressLocality: t.city } } }
      : {}),
    ...(t.photo ? { image: [`${site.url}${t.photo.src}`] } : {}),
    ...(t.link ? { url: t.link } : {}),
    competitor: { "@type": "SportsOrganization", name: site.name, url: site.url },
  };

  const pageSlugs = new Map(athletesWithPage.map((a) => [slugify(a.name), a.slug]));

  return (
    <>
      <PageHero
        eyebrow={`${t.level} · ${t.weapon}`}
        title={t.name}
        lede={[formatDate(t.date), t.city, t.category].filter(Boolean).join(" · ")}
        path={`/resultados/${t.slug}`}
      />
      <Section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="reveal mx-auto max-w-2xl">
          {t.summary && <p className="leading-relaxed text-ink-soft">{t.summary}</p>}
          {t.photo && (
            <Photo
              src={t.photo.src}
              alt={`Tiradores del club en ${t.name}`}
              width={t.photo.width}
              height={t.photo.height}
              className="mt-6 h-auto w-full rounded-sm border border-line"
            />
          )}

          <h2 className="mt-10 font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Resultados del club
          </h2>
          {t.results.length === 0 ? (
            <p className="mt-3 text-ink-soft">Aún no hay resultados publicados de este torneo.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-sm border border-line">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Clasificación de los tiradores del club</caption>
                <thead className="bg-paper-raised font-mono text-xs uppercase tracking-wide text-ink-faint">
                  <tr>
                    <th scope="col" className="px-4 py-3">Puesto</th>
                    <th scope="col" className="px-4 py-3">Tirador/a</th>
                    <th scope="col" className="px-4 py-3">Medalla</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {t.results.map((r, i) => {
                    const target = pageSlugs.get(slugify(r.athlete));
                    return (
                      <tr key={i}>
                        <td className="px-4 py-3 font-display text-lg font-bold tabular text-ink">
                          {r.position ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-ink">
                          {target ? (
                            <Link
                              href={`/deportistas/${target}`}
                              className="link-touche font-semibold text-accent-dark"
                            >
                              {r.athlete}
                            </Link>
                          ) : (
                            r.athlete
                          )}
                        </td>
                        <td className="px-4 py-3">{r.medal && <MedalBadge medal={r.medal} />}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {t.link && (
            <p className="mt-6 text-sm">
              <a
                href={t.link}
                target="_blank"
                rel="noopener noreferrer"
                className="link-touche font-semibold text-accent-dark"
              >
                Ver la clasificación oficial completa ↗
              </a>
            </p>
          )}
          <Link
            href="/resultados"
            className="link-touche mt-10 inline-block text-sm font-semibold uppercase tracking-wide text-accent-dark"
          >
            ← Todos los resultados
          </Link>
        </article>
      </Section>
    </>
  );
}
