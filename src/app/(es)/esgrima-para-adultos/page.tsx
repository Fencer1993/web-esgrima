import type { Metadata } from "next";
import { pageAlternates } from "@/content/i18n";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { pageText } from "@/content/texts";
import { Section } from "@/components/Section";
import { PhotoRow } from "@/components/PhotoRow";
import { whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Esgrima para Adultos",
  description:
    "Clases de esgrima para adolescentes desde 13 años y adultos en Torremolinos. Esgrima Ocio o Esgrima Competición: tú eliges el nivel.",
  alternates: pageAlternates("/esgrima-para-adultos"),
};

export default function EsgrimaAdultos() {
  const hero = pageText("/esgrima-para-adultos");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/esgrima-para-adultos"
      />

      <Section>
        <div className="mb-10">
          <PhotoRow
            feature
            names={[
              "grupo-esgrimistas-club-torremolinos-sala-ayuntamiento",
              "esgrimistas-adultos-club-torremolinos-torneo",
              "podio-absoluto-torneo-jaen-oro",
            ]}
          />
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          Ofrecemos esgrima para adultos y adolescentes en Torremolinos, en un grupo que
          entrena de martes a viernes, más una sesión de tecnificación los lunes para quien
          quiere competir. Adaptamos el entrenamiento a la edad y a las características de
          cada deportista: están los que acaban de empezar, los que compiten a nivel andaluz
          o nacional y los adultos y veteranos (30 años en adelante) que vienen por puro
          ocio. Y sí, también hay competición para veteranos. El ambiente es de los que
          enganchan.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              Esgrima Ocio
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              ¿Quieres divertirte y moverte un poco? Entrenas a tu ritmo, te echas asaltos por
              pura diversión y siempre hay sitio para el buen rollo.
            </p>
          </div>
          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              Esgrima Competición
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              ¿Quieres entrenar y salir a competir? El límite lo pones tú: clases individuales,
              competición federada y estrategias avanzadas. Los lunes hay tecnificación
              deportiva, de 18:00 a 20:00 para 13 a 18 años y de 20:00 a 22:00 para mayores de 18.
            </p>
          </div>
        </div>

        <div className="mt-10 max-w-2xl space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            Nos gusta enseñar jugando, pero también tenemos metodología de entrenamiento para
            competir: preparación física de base para todos y trabajo más específico para
            quienes van a por los torneos.
          </p>
          <p>
            Cada sesión empieza con calentamiento general y específico, estiramientos y
            ejercicios de acondicionamiento físico, a veces con desplazamientos de esgrima.
            Después llega el trabajo técnico-táctico con sables, chaqueta y guantes, siempre
            con la seguridad por delante. A partir de ahí, a tirar: asaltos dirigidos o
            libres. Si llevas poco tiempo, recibirás clases individuales para ir cogiendo
            soltura. Para terminar, estiramientos para prevenir las agujetas.
          </p>
        </div>
      </Section>

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
            href={whatsappLink("Hola, quiero información sobre esgrima para adultos")}
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
    </>
  );
}
