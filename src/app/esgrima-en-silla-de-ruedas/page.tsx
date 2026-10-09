import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { pageText } from "@/content/texts";
import { Section, SectionHeading } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { PhotoRow } from "@/components/PhotoRow";
import { FaqAccordion } from "@/components/FaqAccordion";
import { whatsappLink } from "@/content/site";
import faqSilla from "@/content/data/faq-silla.json";

const wheelchairFaq = faqSilla.items;



export const metadata: Metadata = {
  title: "Esgrima en Silla de Ruedas",
  description:
    "El Club de Esgrima Torremolinos es la única sala de Andalucía con esgrima en silla de ruedas. Deporte adaptado e inclusivo, entrenado por un seleccionador nacional.",
  alternates: { canonical: "/esgrima-en-silla-de-ruedas" },
};

export default function SillaDeRuedas() {
  const hero = pageText("/esgrima-en-silla-de-ruedas");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: wheelchairFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/esgrima-en-silla-de-ruedas"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
            <p>
              En Torremolinos entrenamos esgrima en silla de ruedas dirigida por
              Carlos Soler, seleccionador nacional de esta modalidad, así que
              tendrás al mejor entrenador dándote clase. Está pensada para
              personas cuya movilidad ha quedado reducida por diversos motivos:
              paraplejia, tetraplejia u otras patologías que limiten o impidan
              el movimiento del tren inferior.
            </p>
            <p>
              Aquí la esgrima es inclusiva de verdad: el club acoge tanto a
              deportistas de esgrima convencional como a quienes tienen alguna
              discapacidad física, y hacemos competiciones amistosas en las que
              ambos perfiles participan en igualdad. La modalidad vale para el
              ocio y también para competir: contamos con deportistas de amplio
              palmarés internacional, como el propio Carlos Soler, Antonio
              Garrido y Lorenzo Ribes.
            </p>
            <p>
              Podrás aprender las tres armas, espada, florete y sable, y
              descubrir lo rápido que se vive un asalto desde la silla.
            </p>
          </div>

          <div className="space-y-6">
            <Photo
              src="/images/galeria/esgrimista-silla-de-ruedas-competicion-torremolinos.webp"
              alt="Antonio Garrido, esgrimista en silla de ruedas del club, en un asalto en la sala del club"
              width={554}
              height={1200}
              className="aspect-[4/5] w-full rounded-sm border border-line object-cover object-[center_40%]"
            />
            <div className="rounded-sm border border-line bg-paper-raised p-6">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                    Horario
                  </dt>
                  <dd className="mt-1 text-ink">
                    Lunes, martes, miércoles y jueves, 10:00–12:30
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                    Mensualidad
                  </dt>
                  <dd className="mt-1 tabular text-ink">
                    30€/mes — incluye la oferta 2×1 y la prueba gratuita
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                    Seguro federativo (FEDDF)
                  </dt>
                  <dd className="mt-1 tabular text-ink">70€/año</dd>
                </div>
              </dl>
              <a
                href={whatsappLink(
                  "Hola, quiero información sobre esgrima en silla de ruedas",
                )}
                className="mt-6 inline-flex w-full items-center justify-center rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
              >
                Contactar con Carlos Soler
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <PhotoRow feature names={["podio-esgrima-adaptada-torneo-jaen"]} />
        </div>
      </Section>

      <Section tone="raised" className="border-t border-line">
        <SectionHeading
          eyebrow="Dudas frecuentes"
          title="Esgrima Adaptada: Preguntas"
        />
        <FaqAccordion items={wheelchairFaq} />
      </Section>
    </>
  );
}
