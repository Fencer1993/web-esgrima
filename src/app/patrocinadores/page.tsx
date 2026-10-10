import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { pageText } from "@/content/texts";
import { Section, SectionHeading } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { sponsors, sponsorText, tiers } from "@/content/sponsors";
import { programs } from "@/content/programs";
import { site, whatsappLink } from "@/content/site";
import cifras from "@/content/data/cifras.json";

export const metadata: Metadata = {
  title: "Patrocinadores",
  description:
    "Quién apoya al Club de Esgrima Torremolinos y cómo puedes colaborar: deporte base, esgrima en silla de ruedas y tiradores en competición.",
  alternates: { canonical: "/patrocinadores" },
};

export default function Patrocinadores() {
  const hero = pageText("/patrocinadores");
  const t = sponsorText;
  const byTier = tiers
    .map((tier) => ({ tier, items: sponsors.filter((s) => s.tier === tier) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} lede={hero.lede} path="/patrocinadores" />

      <Section>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-soft">{t.intro}</p>

        <div className="mt-12">
          {byTier.length === 0 ? (
            <div className="rounded-sm border border-dashed border-line bg-paper-raised px-6 py-10 text-center">
              <p className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
                {t.emptyTitle}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{t.emptyText}</p>
            </div>
          ) : (
            <div className="space-y-10">
              {byTier.map((g) => (
                <section key={g.tier} aria-label={`Patrocinadores: ${g.tier}`}>
                  <h2 className="mb-4 border-l-2 border-accent pl-3 font-display text-2xl font-bold uppercase tracking-tight text-ink">
                    {g.tier}
                  </h2>
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {g.items.map((s) => {
                      const inner = s.logo ? (
                        <Photo
                          src={s.logo.src}
                          alt={s.name}
                          width={s.logo.width}
                          height={s.logo.height}
                          className="max-h-20 w-auto max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-center font-display text-lg font-semibold uppercase tracking-tight text-ink">
                          {s.name}
                        </span>
                      );
                      const box =
                        "flex h-28 items-center justify-center rounded-sm border border-line bg-paper-raised p-4";
                      return (
                        <li key={s.name}>
                          {s.url ? (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              aria-label={s.name}
                              className={`${box} transition-colors hover:border-accent`}
                            >
                              {inner}
                            </a>
                          ) : (
                            <div className={box}>{inner}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section tone="raised" className="border-y border-line">
        <SectionHeading eyebrow="Colabora" title={t.reasonsTitle} />
        <ul className="grid gap-6 sm:grid-cols-2">
          {t.reasons.map((r) => (
            <li
              key={r.title}
              className="reveal rounded-sm border border-line bg-paper p-6"
            >
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
                {r.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeading eyebrow="Memoria" title={t.memoriaTitle} lede={t.memoriaLede} />
        <dl className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
          {cifras.stats.map((s) => (
            <div key={s.label} className="border-l-2 border-accent pl-4">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="font-display text-5xl font-bold tabular text-ink">
                  {s.value}
                </span>
                <span className="ml-2 font-display text-lg font-semibold uppercase tracking-tight text-ink">
                  {s.label}
                </span>
                <span className="mt-1 block text-xs text-ink-faint">{s.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-12 font-display text-xl font-bold uppercase tracking-tight text-ink">
          Nuestros programas
        </h3>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {programs.map((p) => (
            <li key={p.slug} className="rounded-sm border border-line bg-paper-raised p-5">
              <Link
                href={`/${p.slug}`}
                className="font-display text-lg font-semibold uppercase tracking-tight text-ink hover:text-accent-dark"
              >
                {p.title}
              </Link>
              <p className="mt-1 text-sm text-ink-soft">{p.ageRange}</p>
              <p className="mt-1 text-xs text-ink-faint">{p.schedule}</p>
            </li>
          ))}
        </ul>
      </Section>

      <section className="bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-14 sm:py-16 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              {t.ctaTitle}
            </h2>
            <p className="mt-3 text-base text-paper/80">{t.ctaText}</p>
            <p className="mt-3 text-sm text-paper/70">
              También puedes escribir a{" "}
              <a
                href={`mailto:${site.contact.email}`}
                className="link-touche font-semibold text-accent"
              >
                {site.contact.email}
              </a>{" "}
              o usar la página de{" "}
              <Link href="/contacto" className="link-touche font-semibold text-accent">
                contacto
              </Link>
              .
            </p>
          </div>
          <a
            href={whatsappLink(t.ctaMessage)}
            className="btn-blade inline-flex shrink-0 items-center justify-center rounded-sm bg-accent px-7 py-4 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
          >
            Escribir por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
