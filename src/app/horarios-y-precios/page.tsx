import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { schedule, plans, bonos, federationFees } from "@/content/pricing";
import { whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Horarios y Precios",
  description:
    "Horarios de esgrima para niños, adultos y esgrima en silla de ruedas en Torremolinos. Precios desde 30€/mes, bonos de ahorro y alquiler de material incluido.",
  alternates: { canonical: "/horarios-y-precios" },
};

export default function HorariosYPrecios() {
  return (
    <>
      <PageHero
        eyebrow="Únete al club"
        title="Horarios y Precios"
        lede="Cuatro grupos, cuatro horarios. Elige el tuyo."
      />

      <Section>
        <SectionHeading eyebrow="Cuándo entrenamos" title="Horarios" />
        <div className="overflow-x-auto rounded-sm border border-line">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-raised text-left">
                <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-ink-faint">
                  Grupo
                </th>
                <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-ink-faint">
                  Días
                </th>
                <th className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-ink-faint tabular">
                  Horario
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s) => (
                <tr key={s.group} className="border-b border-line last:border-none">
                  <td className="px-4 py-3 font-medium text-ink">
                    {s.group}
                    {s.note && <p className="mt-1 text-xs font-normal text-ink-faint">{s.note}</p>}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{s.days}</td>
                  <td className="px-4 py-3 tabular text-ink-soft">{s.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <Section tone="raised" className="border-y border-line">
        <SectionHeading eyebrow="Cuotas mensuales" title="Precios" />
        <div className="grid gap-6 sm:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className="rounded-sm border border-line bg-paper-raised p-6">
              <h3 className="text-lg font-semibold uppercase tracking-tight text-ink">
                {p.name}
              </h3>
              <p className="mt-2">
                <span className="font-display text-4xl font-bold tabular text-accent">
                  {p.price}
                </span>{" "}
                <span className="text-sm text-ink-faint">{p.period}</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-accent">—</span>
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
                className="flex items-center justify-between rounded-sm border border-line bg-paper-raised p-5"
              >
                <div>
                  <p className="font-semibold uppercase tracking-tight text-ink">{b.name}</p>
                  <p className="text-sm text-ink-faint">{b.note}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold tabular text-accent">
                    {b.price}
                  </p>
                  <p className="text-xs tabular text-ink-faint">{b.childPrice}</p>
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
        <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
          {federationFees.map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-between rounded-sm border border-line bg-paper-raised px-4 py-3 text-sm"
            >
              <span className="text-ink-soft">{f.label}</span>
              <span className="tabular font-semibold text-ink">{f.price}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
