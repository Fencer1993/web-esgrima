import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { AthleteGrid } from "@/components/AthleteGrid";
import { coaches } from "@/content/programs";
import { Photo } from "@/components/Photo";
import { CoachCard } from "@/components/CoachCard";

export const metadata: Metadata = {
  title: "Nuestro Equipo",
  description:
    "Conoce a los entrenadores y deportistas del Club de Esgrima Torremolinos: quién te enseñará en clase y quiénes nos representan en competición.",
  alternates: { canonical: "/nuestro-equipo" },
};

export default function NuestroEquipo() {
  return (
    <>
      <PageHero
        eyebrow="Quiénes somos"
        title="Nuestro Equipo"
        lede="Los entrenadores que te recibirán en tu primera clase y los deportistas que llevan el nombre del club a competición."
        path="/nuestro-equipo"
      />

      <section className="relative overflow-hidden bg-ink text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 -skew-x-12 bg-steel/25"
        />
        <div className="relative mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:grid-cols-3 sm:py-10">
          {[
            ["Sable", "Nuestra especialidad en esgrima a pie"],
            ["Todas las edades", "De niños a adultos"],
            ["Esgrima adaptada", "En silla de ruedas"],
          ].map(([big, small]) => (
            <div key={big} className="reveal border-l-2 border-accent pl-4">
              <p className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                {big}
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-paper/70">
                {small}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="Entrenadores"
          title="Quién te va a enseñar"
          lede="Están cualificados para entrenar las tres armas. En la esgrima a pie nos especializamos en sable; en la esgrima adaptada trabajamos las tres."
        />
        <div className="reveal mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {coaches.map((c) => (
            <CoachCard key={c.name} coach={c} />
          ))}
        </div>
      </Section>

      <Section tone="raised" className="border-t-4 border-t-accent">
        <SectionHeading
          eyebrow="Deportistas"
          title="Nuestros Deportistas"
          lede="Los tiradores que defienden los colores del Club de Esgrima Torremolinos en competición."
        />
        <Photo
          src="/images/galeria/grupo-esgrimistas-club-torremolinos-sala-ayuntamiento.webp"
          alt="Grupo de esgrimistas de todas las edades haciendo el saludo con los sables en una sala de Torremolinos"
          width={1200}
          height={900}
          className="aspect-[16/9] w-full rounded-sm border border-line object-cover object-[center_45%]"
        />
        <div aria-hidden className="mx-auto my-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="h-2 w-2 rotate-45 bg-accent" />
          <span className="h-px flex-1 bg-line" />
        </div>
        <AthleteGrid />
      </Section>
    </>
  );
}
