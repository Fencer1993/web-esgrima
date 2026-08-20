import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/Section";
import { InstagramCta } from "@/components/InstagramCta";
import { site, whatsappLink } from "@/content/site";
import { programs, values, coaches } from "@/content/programs";

export const metadata: Metadata = {
  title: "Clases de esgrima en Torremolinos, Málaga",
  description: site.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-ink text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-2/3 origin-top-right skew-x-[-12deg] bg-steel/50"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:py-28 lg:grid-cols-[3fr_2fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Torremolinos · Málaga
            </p>
            <h1 className="mt-4 text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Club de Esgrima Torremolinos
            </h1>
            <p className="mt-5 max-w-lg text-lg text-paper/80">
              Clases de esgrima para niños desde 6 años, adolescentes, adultos y esgrima
              adaptada en silla de ruedas. Ven y prueba gratis.
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

          <dl className="grid grid-cols-1 gap-4 border-t border-paper/15 pt-6 text-sm sm:grid-cols-3 lg:border-t-0 lg:pt-0">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-paper/50">
                Dirección
              </dt>
              <dd className="mt-1 text-paper/85">
                {site.address.line}, {site.address.postalCode} {site.address.city}
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
                Esgrima: L,M,X,J 18:30–21:00, V 20:00–22:00
                <br />
                Silla de ruedas: L,M,X,J 10:00–12:30
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <Section>
        <SectionHeading eyebrow="Programas" title="Clases de Esgrima en Torremolinos" />
        <div className="reveal grid gap-6 sm:grid-cols-3">
          {programs.map((p) => (
            <Link
              key={p.slug}
              href={`/${p.slug}`}
              className="group flex flex-col justify-between rounded-sm border border-line bg-paper-raised p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg"
            >
              <div>
                <h3 className="text-xl font-semibold uppercase tracking-tight text-ink">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{p.tagline}</p>
              </div>
              <span className="link-touche mt-6 self-start text-sm font-semibold uppercase tracking-wide text-accent">
                Saber más →
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="raised" className="border-y border-line">
        <SectionHeading eyebrow="Club de Esgrima Torremolinos" title="Nuestros Valores" />
        <div className="reveal grid gap-8 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title}>
              <h3 className="text-lg font-semibold uppercase tracking-tight text-ink">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.body}</p>
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
            <div
              key={c.name}
              className="rounded-sm border border-line bg-paper-raised p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold uppercase tracking-tight text-ink">
                {c.name}
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-accent">
                {c.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.bio}</p>
              <div className="mt-4 space-y-1 text-sm text-ink-soft">
                <p>
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:text-ink">
                    {c.phone}
                  </a>
                </p>
                {c.email && (
                  <p>
                    <a href={`mailto:${c.email}`} className="hover:text-ink">
                      {c.email}
                    </a>
                  </p>
                )}
              </div>
            </div>
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
              Somos una de las pocas salas que practica sable en Andalucía. El sable permite
              el tocado con el filo, contrafilo y punta — sin botón, a diferencia de espada y
              florete. Es una modalidad muy dinámica que pide rapidez, toma de decisiones y
              buenos reflejos. Al principio cuesta entender la dinámica de un asalto, pero en
              poco tiempo se aprenden las reglas: es el arma que más gusta al público.
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
            Ven y prueba a practicar esgrima con nosotros. Recibe una clase gratis y disfruta
            del buen ambiente del Club de Esgrima Torremolinos.
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
