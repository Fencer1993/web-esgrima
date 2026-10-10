import type { Metadata } from "next";
import { pageAlternates } from "@/content/i18n";
import { PageHero } from "@/components/PageHero";
import { pageText } from "@/content/texts";
import { Section } from "@/components/Section";
import { FaqAccordion } from "@/components/FaqAccordion";
import { faq } from "@/content/faq";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description:
    "Resuelve tus dudas sobre esgrima: qué armas existen, qué material necesitas, precios de federación, edad para empezar y todo lo que necesitas saber para apuntarte.",
  alternates: pageAlternates("/preguntas-frecuentes"),
};

export default function PreguntasFrecuentes() {
  const hero = pageText("/preguntas-frecuentes");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
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
        path="/preguntas-frecuentes"
      />
      <Section>
        <FaqAccordion items={faq} />
      </Section>
    </>
  );
}
