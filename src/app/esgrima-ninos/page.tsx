import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { pageText } from "@/content/texts";
import { Section } from "@/components/Section";
import { PhotoRow } from "@/components/PhotoRow";
import { whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Esgrima para Niños",
  description:
    "Clases de esgrima para niños desde 6 años en Torremolinos. Entrenadores cualificados, aprendizaje a través del juego y máxima seguridad.",
  alternates: { canonical: "/esgrima-ninos" },
};

export default function EsgrimaNinos() {
  const hero = pageText("/esgrima-ninos");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/esgrima-ninos"
      />

      <Section>
        <div className="mb-10">
          <PhotoRow
            feature
            names={[
              "equipo-infantil-juvenil-esgrima-torremolinos-almeria",
              "clase-grupal-esgrima-sala-club-torremolinos",
              "equipo-infantil-esgrima-torremolinos-competicion",
            ]}
          />
        </div>
        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            En el Club de Esgrima Torremolinos damos clase de esgrima para niños a partir de
            los 6 años, en grupos reducidos y con entrenadores que saben trabajar con los más
            pequeños. Elegimos esa edad para poder jugar todos juntos y para que la clase se
            ajuste a cada etapa: los grupos son homogéneos y lo hacemos jugando, ¡claro!
          </p>
          <p>
            A estas edades, lo que más funciona es que se lo pasen bien. La técnica, la
            estrategia y el esfuerzo físico llegan solos cuando uno se divierte, así que
            durante la hora que pasan con nosotros estarán jugando la gran mayoría del tiempo.
            Muchos salen sin darse cuenta de que han aprendido algo.
          </p>
          <h2 className="pt-4 font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Seguridad lo primero
          </h2>
          <p>
            En los ejercicios de esgrima van muy seguros. De hecho, la esgrima es incluso más
            segura que el bádminton. Cuando son muy pequeños se les dan armas de gomaespuma o
            de plástico y caretas de plástico. Cuando crecen un poco y se vuelven más
            responsables, pasan a los sables convencionales, y ahí se sienten ya como
            auténticos esgrimistas.
          </p>
          <p>
            Si un día les pica el gusanillo de competir, tendrán que adquirir su propia
            equipación, ya que las competiciones oficiales exigen material específico.
          </p>
        </div>
      </Section>

      <NextSteps />
    </>
  );
}

function NextSteps() {
  return (
    <Section tone="raised" className="border-t border-line">
      <div className="grid gap-6 sm:grid-cols-3">
        <Link
          href="/instalaciones"
          className="rounded-sm border border-line bg-paper-raised p-6 transition-colors hover:border-accent"
        >
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            ¿Aún nada?
          </p>
          <p className="mt-2 font-display text-lg font-semibold uppercase tracking-tight text-ink">
            Conoce las instalaciones
          </p>
        </Link>
        <Link
          href="/preguntas-frecuentes"
          className="rounded-sm border border-line bg-paper-raised p-6 transition-colors hover:border-accent"
        >
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            ¿Tienes dudas?
          </p>
          <p className="mt-2 font-display text-lg font-semibold uppercase tracking-tight text-ink">
            Preguntas Frecuentes
          </p>
        </Link>
        <a
          href={whatsappLink("Hola, quiero información sobre esgrima para niños")}
          className="rounded-sm border border-accent bg-accent p-6 text-white transition-colors hover:bg-accent-dark"
        >
          <p className="font-mono text-xs uppercase tracking-wide text-white/70">
            ¿Convencido?
          </p>
          <p className="mt-2 font-display text-lg font-semibold uppercase tracking-tight">
            Contacta con nosotros
          </p>
        </a>
      </div>
    </Section>
  );
}
