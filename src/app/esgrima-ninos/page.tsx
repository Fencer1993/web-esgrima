import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Esgrima para Niños",
  description:
    "Clases de esgrima para niños desde 6 años en Torremolinos. Entrenadores cualificados, aprendizaje a través del juego y máxima seguridad.",
  alternates: { canonical: "/esgrima-ninos" },
};

export default function EsgrimaNinos() {
  return (
    <>
      <PageHero
        eyebrow="6–12 años"
        title="Esgrima para Niños"
        lede="Los grandes deportistas empiezan a practicar desde niños."
        path="/esgrima-ninos"
      />

      <Section>
        <Photo
          src="/images/programas/esgrima-ninos-torremolinos.webp"
          alt="Grupo de niños del Club de Esgrima Torremolinos con sus entrenadores y equipación del club"
          width={1200}
          height={900}
          className="mb-10 aspect-[16/9] w-full max-w-2xl rounded-sm border border-line object-cover object-[center_60%]"
        />
        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            En el Club de Esgrima Torremolinos damos clase de esgrima para niños a partir de
            los 6 años, en grupos reducidos y con entrenadores especializados en trabajar con
            los más pequeños. Ponemos el límite en esa edad de cara a la inclusión en juegos y
            a la capacidad de adaptar la clase a edades madurativas demasiado distantes:
            trabajamos con grupos homogéneos, ¡y lo hacemos jugando!
          </p>
          <p>
            De poco nos sirve enseñar la técnica y las estrategias, o incluso realizar un
            trabajo físico exigente, cuando son tan pequeños. Queremos que se lo pasen bien y
            así aprendan: durante la hora que pasan con nosotros en las instalaciones estarán
            jugando la gran mayoría del tiempo.
          </p>
          <h2 className="pt-4 font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Seguridad lo primero
          </h2>
          <p>
            Cuando tienen que hacer ejercicios relacionados con la esgrima están muy seguros —
            de hecho, la esgrima es incluso más segura que el bádminton. Cuando son muy
            pequeños se les dan armas de gomaespuma o de plástico, así como caretas de
            plástico. Cuando son un poco más grandes y responsables, utilizan sables
            convencionales.
          </p>
          <p>
            Si los pequeños quieren llegar a competir tendrían que adquirir su propia
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
