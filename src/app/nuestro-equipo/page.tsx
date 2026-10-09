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

      <Section>
        <SectionHeading
          eyebrow="Entrenadores"
          title="Quién te va a enseñar"
          lede="Están cualificados para entrenar las tres armas. En la esgrima a pie nos especializamos en sable; en la esgrima adaptada trabajamos las tres."
        />
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {coaches.map((c) => (
            <CoachCard key={c.name} coach={c} />
          ))}
        </div>
      </Section>

      <Section tone="raised" className="border-t border-line">
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
          className="mb-8 aspect-[16/9] w-full rounded-sm border border-line object-cover object-[center_45%]"
        />
        <AthleteGrid />
      </Section>
    </>
  );
}
