import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/Section";
import { InstagramCta } from "@/components/InstagramCta";
import { site, whatsappLink } from "@/content/site";
import { programs, values, coaches } from "@/content/programs";
import { CoachCard } from "@/components/CoachCard";
import { Photo } from "@/components/Photo";
import { Marquee } from "@/components/Marquee";
import { StatsBand } from "@/components/StatsBand";
import { CompetitionPromo } from "@/components/CompetitionPromo";
import { galleryPhoto } from "@/content/gallery";

export const metadata: Metadata = {
  title: "Clases de esgrima en Torremolinos, Málaga",
  description: site.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <section className="blade-flash relative overflow-hidden border-b border-line bg-ink text-paper">
        <Photo
          src="/images/portada/esgrima-sable-torremolinos-portada.webp"
          alt="Dos esgrimistas de sable en pleno asalto durante una competición"
          width={1077}
          height={698}
          priority
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/35 lg:via-ink/70"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:py-28 lg:grid-cols-[3fr_2fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Torremolinos · Málaga
            </p>
            <h1 className="mt-4 text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl blur-in">
              <span style={{ animationDelay: "0.00s" }}>Club</span>{" "}
              <span style={{ animationDelay: "0.08s" }}>de</span>{" "}
              <span style={{ animationDelay: "0.16s" }}>Esgrima</span>{" "}
              <span style={{ animationDelay: "0.24s" }}>Torremolinos</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-paper/80">
              Clases de esgrima para niños desde 6 años, adolescentes, adultos y
              esgrima adaptada en silla de ruedas. Ven y prueba gratis.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={whatsappLink("Hola, quiero probar una clase gratis")}
                className="btn-blade inline-flex items-center rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
              >
                ¡Ven y prueba gratis!
              </a>
              <Link
                href="/horarios-y-precios"
                className="inline-flex items-center rounded-sm border border-paper/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:border-paper"
              >
                Ver horarios y precios
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 border-t border-paper/15 pt-6 text-sm sm:grid-cols-3 lg:rounded-sm lg:border lg:border-paper/10 lg:bg-ink/60 lg:p-5 lg:backdrop-blur-sm">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-paper/50">
                Dirección
              </dt>
              <dd className="mt-1 text-paper/85">
                {site.address.line}, {site.address.postalCode}{" "}
                {site.address.city}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-paper/50">
                Llámanos
              </dt>
              <dd className="mt-1 text-paper/85">{site.contact.phone}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-paper/50">
                Horarios
              </dt>
              <dd className="mt-1 text-paper/85">
                Esgrima: M,X,J,V 18:30–21:00
                <br />
                Competición: lunes 18:00–22:00
                <br />
                Silla de ruedas: M,X,J,V 10:00–12:30
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <StatsBand />

      <Section>
        <SectionHeading
          eyebrow="Programas"
          title="Clases de Esgrima en Torremolinos"
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
              text: "Los lunes, sesión específica para quien quiere competir.",
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
                <Photo
                  src={g.src}
                  alt={g.alt}
                  width={g.width}
                  height={g.height}
                  className="absolute inset-0 h-full w-full object-cover object-[center_35%] transition-transform duration-700 group-hover:scale-105"
                />
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

      <Section tone="raised" className="border-y border-line">
        <SectionHeading
          eyebrow="Club de Esgrima Torremolinos"
          title="Nuestros Valores"
        />
        <div className="reveal grid gap-8 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title}>
              <h3 className="text-lg font-semibold uppercase tracking-tight text-ink">
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
          lede="Cualificados para entrenar esgrima a las tres armas. Nos especializamos en sable en la esgrima a pie; en la esgrima adaptada incluimos las tres."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
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
              Somos una de las pocas salas que practica sable en Andalucía. El
              sable permite el tocado con el filo, contrafilo y punta — sin
              botón, a diferencia de espada y florete. Es una modalidad muy
              dinámica que pide rapidez, toma de decisiones y buenos reflejos.
              Al principio cuesta entender la dinámica de un asalto, pero en
              poco tiempo se aprenden las reglas: es el arma que más gusta al
              público.
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
            No lo pienses más
          </h2>
          <p className="max-w-xl text-paper/75">
            Ven y prueba a practicar esgrima con nosotros. Recibe una clase
            gratis y disfruta del buen ambiente del Club de Esgrima
            Torremolinos.
          </p>
          <a
            href={whatsappLink("Hola, quiero probar una clase gratis")}
            className="btn-blade inline-flex items-center rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
          >
            ¡Quiero probar!
          </a>
        </div>
      </Section>
    </>
  );
}
