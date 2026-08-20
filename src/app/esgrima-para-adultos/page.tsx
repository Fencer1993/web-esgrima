import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Esgrima para Adultos",
  description:
    "Clases de esgrima para adolescentes desde 13 años y adultos en Torremolinos. Esgrima Ocio o Esgrima Competición: tú eliges el nivel.",
  alternates: { canonical: "/esgrima-para-adultos" },
};

export default function EsgrimaAdultos() {
  return (
    <>
      <PageHero
        eyebrow="Desde 13 años"
        title="Esgrima para Adultos"
        lede="Adolescentes desde 13 años y adultos hasta —por ejemplo— los 100 años pueden practicar esgrima con nosotros."
        path="/esgrima-para-adultos"
      />

      <Section>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          Nuestro grupo abarca un rango grande de edades porque adaptamos el entrenamiento a
          la edad y a las características físicas de cada deportista: desde quienes se acaban
          de iniciar hasta quienes compiten a nivel andaluz o nacional, pasando por adultos y
          veteranos (30 años en adelante) que practican por puro ocio. Y sí, también hay
          competición para los más veteranos — el ambiente es muy bueno.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              Esgrima Ocio
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              ¿Quieres divertirte y hacer algo de deporte? Entrenas a tu ritmo, haces asaltos
              por diversión — siempre hay espacio para el buen rollo.
            </p>
          </div>
          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              Esgrima Competición
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              ¿Quieres entrenar y competir? El límite lo pones tú: clases individuales,
              competición federada y estrategias avanzadas.
            </p>
          </div>
        </div>

        <div className="mt-10 max-w-2xl space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            Nos gusta enseñar mediante el juego, pero también tenemos metodologías de
            entrenamiento para competición: preparación física de base para todos los
            deportistas, y entrenamientos más específicos para quienes compiten.
          </p>
          <p>
            Los entrenamientos incluyen calentamiento general y específico, estiramientos,
            ejercicios de acondicionamiento físico —a veces con desplazamientos de esgrima—, y
            trabajo técnico-táctico con sables, chaquetas y guantes. La seguridad es lo
            primero. A partir de ahí, asaltos dirigidos o libres; si llevas poco tiempo,
            recibirás clases individuales. Para finalizar, estiramientos para prevenir las
            agujetas.
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
