import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { Gallery } from "@/components/Gallery";
import { whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Instalaciones",
  description:
    "Dos pistas de esgrima, aparatos de señalización y material completo en el Club de Esgrima Torremolinos. La única sala de Andalucía con pista de esgrima en silla de ruedas.",
  alternates: { canonical: "/instalaciones" },
};

export default function Instalaciones() {
  return (
    <>
      <PageHero eyebrow="Nuestro club" title="Instalaciones" path="/instalaciones" />

      <Section>
        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            Una de las cosas que más nos gusta de nuestro club, después de nuestros alumnos,
            son las instalaciones en las que practicamos este deporte. Tenemos 2 pistas para
            practicar y realizar asaltos, además de aparatos de señalización dispuestos en
            alto para poder arbitrar con facilidad.
          </p>
          <p>
            También disponemos de material de esgrima —chaquetas, guantes, caretas, chaquetas
            eléctricas, pasantes— e incluso material deportivo para ejercicios de
            acondicionamiento físico. Solo te pediremos que traigas ropa deportiva, agua y
            toalla: el material de esgrima te lo facilita el entrenador.
          </p>
          <p>
            Además, podemos enorgullecernos de ser una de las muy pocas salas de Andalucía que
            cuenta con pista para hacer esgrima en silla de ruedas —también con su propio
            aparato de señalización. Nos gusta poder presumir de esgrima inclusiva.
          </p>
        </div>
      </Section>

      <Section tone="raised" className="border-y border-line">
        <SectionHeading
          eyebrow="Galería"
          title="Entrenamientos y competiciones"
          lede="Fotos de nuestro club y nuestros deportistas en acción (o en el podio)."
        />
        <Gallery />
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 rounded-sm border border-line bg-ink px-6 py-12 text-paper sm:px-10">
          <h2 className="max-w-xl text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            Te esperamos en el Club de Esgrima Torremolinos
          </h2>
          <p className="max-w-xl text-paper/75">
            Si te gustan nuestras instalaciones y nuestras fotos, seguro que querrás formar
            parte del club. ¡Tenemos muy buen ambiente!
          </p>
          <a
            href={whatsappLink("Hola, quiero conocer las instalaciones")}
            className="inline-flex items-center rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
          >
            Escríbenos
          </a>
        </div>
      </Section>
    </>
  );
}
