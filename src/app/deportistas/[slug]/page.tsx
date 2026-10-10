import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { MedalBadge, MedalCounts } from "@/components/MedalBadge";
import { athleteBySlug, athletesWithPage } from "@/content/athletePages";
import { formatDate } from "@/content/results";

export const dynamicParams = false;

// Solo se generan páginas para deportistas con resultados o biografía.
export function generateStaticParams() {
  // Con "output: export" Next exige al menos una ruta: si aún no hay datos se
  // genera un marcador que la página resuelve con notFound() (404).
  const params = athletesWithPage.map((a) => ({ slug: a.slug }));
  return params.length > 0 ? params : [{ slug: "_" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = athleteBySlug(slug);
  if (!a) return {};
  return {
    title: `${a.name}, deportista del club`,
    description: `Palmarés y trayectoria de ${a.name}, deportista del Club de Esgrima Torremolinos.`,
    alternates: { canonical: `/deportistas/${a.slug}` },
  };
}

export default async function Deportista({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = athleteBySlug(slug);
  if (!a) notFound();

  const facts = [
    a.weapon ? `Arma: ${a.weapon}` : null,
    a.since ? `En el club desde ${a.since}` : null,
  ].filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow="Deportista del club"
        title={a.name}
        lede={facts.join(" · ") || undefined}
        path={`/deportistas/${a.slug}`}
      />
      <Section>
        <article className="reveal mx-auto max-w-2xl">
          {a.photo && (
            <Photo
              src={a.photo.src}
              alt={`${a.name}, deportista del Club de Esgrima Torremolinos`}
              width={a.photo.width}
              height={a.photo.height}
              className="mb-6 h-auto w-full max-w-xs rounded-sm border border-line"
            />
          )}
          {a.bio && (
            <div className="space-y-4 leading-relaxed text-ink-soft">
              {a.bio
                .split(/\n\s*\n/)
                .map((p) => p.trim())
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
            </div>
          )}

          {a.entries.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-2xl font-bold uppercase tracking-tight text-ink">
                Palmarés
              </h2>
              <div className="mt-3">
                <MedalCounts {...a.medals} />
              </div>
              <ul className="mt-4 divide-y divide-line rounded-sm border border-line">
                {a.entries.map(({ tournament: t, result: r }, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                    <span className="w-10 font-display text-lg font-bold tabular text-ink">
                      {r.position ? `${r.position}º` : "—"}
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      <Link
                        href={`/resultados/${t.slug}`}
                        className="link-touche font-semibold text-accent-dark"
                      >
                        {t.name}
                      </Link>
                      <span className="block text-xs text-ink-faint">
                        {[formatDate(t.date), t.category].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    {r.medal && <MedalBadge medal={r.medal} />}
                  </li>
                ))}
              </ul>
            </>
          )}

          <Link
            href="/nuestro-equipo"
            className="link-touche mt-10 inline-block text-sm font-semibold uppercase tracking-wide text-accent-dark"
          >
            ← Nuestro equipo
          </Link>
        </article>
      </Section>
    </>
  );
}
