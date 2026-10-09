import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { Gallery } from "@/components/Gallery";
import { galleryItems } from "@/content/gallery";
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
      <PageHero
        eyebrow="Nuestro club"
        title="Instalaciones"
        lede="Entrenamos en el Palacio de Deportes San Miguel de Torremolinos, con dos pistas de esgrima y una pista adaptada para silla de ruedas."
        path="/instalaciones"
      />

      <Section>
        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            Después de nuestros alumnos, lo que más queremos del club es la sala donde
            entrenamos. Tiene 2 pistas de esgrima para practicar y hacer asaltos, y aparatos de
            señalización colocados en alto para que el arbitraje sea fácil de seguir.
          </p>
          <p>
            Tenemos el material de esgrima: chaquetas, guantes, caretas, chaquetas eléctricas
            y pasantes. También material deportivo para el acondicionamiento físico. Tú solo
            traes ropa deportiva, agua y toalla, y el entrenador te da el resto.
          </p>
          <p>
            Y presumimos de algo más: somos una de las muy pocas salas de Andalucía con pista
            para hacer esgrima en silla de ruedas, con su propio aparato de señalización. Nos
            hace mucha ilusión poder presumir de esgrima inclusiva.
          </p>
        </div>
      </Section>

      <Section tone="raised" className="border-y border-line">
        <SectionHeading
          eyebrow="Galería"
          title="Entrenamientos y competiciones"
          lede="Así se vive el club: nuestros deportistas en acción, y a veces en el podio."
        />
        <Gallery items={galleryItems} />
      </Section>

      <Section>
        <div className="flex flex-col items-start gap-6 rounded-sm border border-line bg-ink px-6 py-12 text-paper sm:px-10">
          <h2 className="max-w-xl text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            Te esperamos en el Club de Esgrima Torremolinos
          </h2>
          <p className="max-w-xl text-paper/75">
            Si te gusta lo que ves en las fotos, ven a verlo en persona. Tenemos muy buen
            ambiente y te sentirás en casa.
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
