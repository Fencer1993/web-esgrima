import type { Metadata } from "next";
import { pageAlternates } from "@/content/i18n";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/Section";
import { InstagramCta } from "@/components/InstagramCta";
import { site, whatsappLink } from "@/content/site";
import { programs, values, coaches } from "@/content/programs";
import { CoachCard } from "@/components/CoachCard";
import { Photo } from "@/components/Photo";
import { Marquee } from "@/components/Marquee";
import { LatestNews } from "@/components/LatestNews";
import { StatsBand } from "@/components/StatsBand";
import { CompetitionPromo } from "@/components/CompetitionPromo";
import { galleryPhoto } from "@/content/gallery";
import { homeText as t } from "@/content/texts";
import { valueIcons } from "@/components/valueIcons";

export const metadata: Metadata = {
  title: "Clases de esgrima en Torremolinos, Málaga",
  description: site.description,
  alternates: pageAlternates("/"),
};

export default function Home() {
  return (
    <>
      <section className="blade-flash relative overflow-hidden border-b border-line bg-ink text-paper">
        <Photo
          src="/images/portada/esgrima-sable-torremolinos-portada.webp"
          alt="Dos esgrimistas de sable en pleno asalto durante una competición"
          width={1800}
          height={1166}
          priority
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/35 lg:via-ink/70"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:py-28 ">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              {t.heroEyebrow}
            </p>
            <h1 className="mt-4 text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl blur-in">
              <span style={{ animationDelay: "0.00s" }}>Club</span>{" "}
              <span style={{ animationDelay: "0.08s" }}>de</span>{" "}
              <span style={{ animationDelay: "0.16s" }}>Esgrima</span>{" "}
              <span style={{ animationDelay: "0.24s" }}>Torremolinos</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-paper/80">
              {t.heroLede}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={whatsappLink("Hola, quiero probar una clase gratis")}
                className="btn-blade inline-flex items-center rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
              >
                {t.heroCta}
              </a>
              <Link
                href="/horarios-y-precios"
                className="inline-flex items-center rounded-sm border border-paper/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:border-paper"
              >
                {t.heroSecondaryCta}
              </Link>
            </div>
          </div>

        </div>
      </section>

      <StatsBand />

      <Section>
        <SectionHeading
          eyebrow="Clases"
          title="Clases de Esgrima en Torremolinos"
          lede="Elige tu grupo y ponte en guardia. Si nunca has cogido un sable, aquí empiezas desde cero y con el material a mano."
        />
        <div className="grid auto-rows-[15rem] gap-4 md:grid-cols-3 md:auto-rows-[17rem]">
          {[
            ...programs.map((p) => ({
              href: `/${p.slug}`,
              title: p.title,
              text: p.tagline,
              photo: p.photo,
            })),
            {
              href: "/horarios-y-precios#tecnificacion",
              title: "Tecnificación y Competición",
              text: "Los lunes, sesión específica para quien quiere competir y subir de nivel.",
              photo: "asalto-competicion-roquetas",
            },
          ].map((tile, i) => {
            const g = galleryPhoto(tile.photo);
            return (
              <Link
                key={tile.href}
                href={tile.href}
                className={`reveal group relative overflow-hidden rounded-sm bg-ink ${
                  i === 0 || i === 3 ? "md:col-span-2" : ""
                }`}
              >
                {/* Foto vertical en recuadro ancho: se ve entera a la derecha y
                    el fondo se rellena con la misma foto desenfocada. */}
                {(i === 0 || i === 3) && g.height > g.width ? (
                  <>
                    <Photo
                      src={g.src}
                      alt=""
                      width={g.width}
                      height={g.height}
                      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl"
                    />
                    <Photo
                      src={g.src}
                      alt={g.alt}
                      width={g.width}
                      height={g.height}
                      className="absolute inset-y-0 right-0 h-full w-auto max-w-[70%] object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  </>
                ) : (
                  <Photo
                    src={g.src}
                    alt={g.alt}
                    width={g.width}
                    height={g.height}
                    className="absolute inset-0 h-full w-full object-cover object-[center_35%] transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/5" />
                <div className="relative flex h-full flex-col justify-end p-6 text-paper">
                  <h3 className="font-display text-2xl font-bold uppercase tracking-tight">
                    {tile.title}
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-paper/80">
                    {tile.text}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
                    Saber más
                    <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <CompetitionPromo />

      <Marquee />

      <LatestNews />

      <Section tone="raised" className="border-y border-line">
        <SectionHeading
          eyebrow="Club de Esgrima Torremolinos"
          title="Nuestros Valores"
        />
        <div className="reveal grid gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-sm border border-line bg-paper p-6 transition duration-300 hover:-translate-y-1 hover:border-accent"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-dark">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {valueIcons[v.icon]}
                </svg>
              </span>
              <h3 className="mt-5 text-lg font-semibold uppercase tracking-tight text-ink">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="reveal">
          <InstagramCta />
        </div>
      </Section>

      <Section tone="raised" className="border-y border-line">
        <SectionHeading
          eyebrow="Nuestro equipo"
          title="Los Entrenadores"
          lede="Tus entrenadores están cualificados para enseñar las tres armas. En la esgrima a pie nos especializamos en sable; en la adaptada trabajamos las tres."
        />
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {coaches.map((c) => (
            <CoachCard key={c.name} coach={c} />
          ))}
        </div>
      </Section>

      <Section className="border-t border-line">
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              El arma que practicamos
            </p>
            <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
              Sable
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
              Somos una de las pocas salas que practica sable en Andalucía. Con
              el sable puedes tocar con el filo, el contrafilo y la punta, y no
              hay botón como en espada y florete. Es un arma muy dinámica, de
              rapidez, decisiones al vuelo y buenos reflejos. Al principio cuesta
              seguir un asalto, pero enseguida le pillas el truco a las reglas.
              Y es, sin duda, la más espectacular de ver.
            </p>
          </div>
          <div className="rounded-sm border border-line bg-paper p-6">
            <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
              Vídeo
            </p>
            <a
              href="https://www.youtube.com/watch?v=wQD05TLU8Yo"
              className="link-touche mt-2 inline-block text-sm font-semibold text-accent"
            >
              Ver esgrima de sable en acción →
            </a>
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 rounded-sm border border-line bg-ink px-6 py-12 text-paper sm:px-10">
          <h2 className="max-w-xl text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            {t.finalTitle}
          </h2>
          <p className="max-w-xl text-paper/75">
            {t.finalText}
          </p>
          <a
            href={whatsappLink("Hola, quiero probar una clase gratis")}
            className="btn-blade inline-flex items-center rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
          >
            {t.finalCta}
          </a>
        </div>
      </Section>
    </>
  );
}
