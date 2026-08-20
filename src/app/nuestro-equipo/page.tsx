import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { AthleteGrid } from "@/components/AthleteGrid";
import { coaches } from "@/content/programs";

export const metadata: Metadata = {
  title: "Nuestro Equipo",
  description:
    "Conoce a los entrenadores y deportistas del Club de Esgrima Torremolinos: quiénes dan las clases y quiénes nos representan en competición.",
  alternates: { canonical: "/nuestro-equipo" },
};

export default function NuestroEquipo() {
  return (
    <>
      <PageHero
        eyebrow="Quiénes somos"
        title="Nuestro Equipo"
        lede="Los entrenadores que dan las clases y los deportistas que representan al club en competición."
        path="/nuestro-equipo"
      />

      <Section>
        <SectionHeading
          eyebrow="Entrenadores"
          title="Quién te va a enseñar"
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

      <Section tone="raised" className="border-t border-line">
        <SectionHeading
          eyebrow="Deportistas"
          title="Nuestros Deportistas"
          lede="Los tiradores que representan al Club de Esgrima Torremolinos en competición."
        />
        <AthleteGrid />
      </Section>
    </>
  );
}
