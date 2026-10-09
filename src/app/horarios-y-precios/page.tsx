import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { schedule, plans, bonos, federationFees } from "@/content/pricing";
import { whatsappLink } from "@/content/site";
import { PricingScheduleCard } from "@/components/PricingScheduleCard";
import { CompetitionPromo } from "@/components/CompetitionPromo";

export const metadata: Metadata = {
  title: "Horarios y Precios",
  description:
    "Horarios de esgrima para niños, adultos y silla de ruedas en Torremolinos, más tecnificación de competición los lunes. Precios desde 30€/mes, bonos y material incluido.",
  alternates: { canonical: "/horarios-y-precios" },
};

export default function HorariosYPrecios() {
  return (
    <>
      <PageHero
        eyebrow="Únete al club"
        title="Horarios y Precios"
        lede="Grupos de lunes a viernes, mañana y tarde, y tecnificación de competición los lunes. Elige el tuyo."
        path="/horarios-y-precios"
      />

      <Section>
        <SectionHeading eyebrow="Cuándo entrenamos" title="Horarios" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schedule.map((s) => (
            <PricingScheduleCard key={s.group} group={s.group} days={s.days} hours={s.hours} note={s.note} />
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-ink-soft">
          Todos tenemos a alguien deseando coger un sable. No le enseñaremos a dejar a nadie
          como un colador, pero os divertiréis igualmente.{" "}
          <a
            href={whatsappLink("Hola, quiero más información sobre los horarios")}
            className="font-semibold text-accent underline underline-offset-4"
          >
            Escríbenos para saber más
          </a>
          .
        </p>
      </Section>

      <CompetitionPromo />

      <Section tone="raised" className="border-y border-line">
        <SectionHeading eyebrow="Cuotas mensuales" title="Precios" />
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className="reveal group relative flex flex-col overflow-hidden rounded-sm border border-line bg-paper-raised p-6 transition duration-200 hover:-translate-y-1 hover:border-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 origin-left bg-accent"
              />
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold uppercase tracking-tight text-ink">
                  {p.name}
                </h3>
                {p.features.some((f) => /material/i.test(f)) && (
                  <span className="shrink-0 rounded-sm bg-accent-soft px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-accent-dark">
                    Material incluido
                  </span>
                )}
              </div>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold tabular text-accent">
                  {p.price}
                </span>
                <span className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                  {p.period}
                </span>
              </p>
              <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm text-ink-soft">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden className="text-accent">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-ink">
            O puedes ahorrar con bonos
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {bonos.map((b) => (
              <div
                key={b.name}
                className="reveal relative overflow-hidden rounded-sm bg-ink p-6 text-paper transition duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 top-0 h-full w-1/3 -skew-x-12 bg-steel/25"
                />
                <div className="relative">
                  <p className="inline-block rounded-sm bg-accent px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-white">
                    {b.note}
                  </p>
                  <p className="mt-3 font-semibold uppercase tracking-tight">{b.name}</p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <p className="font-display text-5xl font-bold tabular">{b.price}</p>
                    <p className="font-mono text-sm tabular text-paper/75">{b.childPrice}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Antes de empezar" title="Alquiler de material" />
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          Nosotros te ponemos todo el material necesario para que inicies la actividad.
          Sabemos que al principio no sabes si te va a gustar la esgrima, así que preferimos
          prestarte el material de manera gratuita durante el primer día y el primer mes en el
          que te apuntes. A partir de ahí irás adquiriendo tu material poco a poco. El material
          alquilado se queda en las instalaciones del club, no necesitas transportarlo a casa.
        </p>
      </Section>

      <Section tone="raised" className="border-t border-line">
        <SectionHeading eyebrow="Obligatorio para competir" title="Seguro federativo" />
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          Somos un club perteneciente a la Federación Andaluza de Esgrima (FAE), por lo que
          nuestros deportistas deben estar asegurados para poder inscribirse al club. Este
          seguro cubre en caso de accidente entrenando o compitiendo, y habilita para la
          competición territorial y el Campeonato de Andalucía. Las cuotas las establece la
          Federación Andaluza de Esgrima:
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {federationFees.map((f) => (
            <div
              key={f.label}
              className="reveal flex flex-col justify-between gap-3 rounded-sm border border-line bg-paper-raised p-4 transition-colors hover:border-accent"
            >
              <span className="text-sm text-ink-soft">{f.label}</span>
              <span className="font-display text-3xl font-bold tabular text-ink">
                {f.price}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
