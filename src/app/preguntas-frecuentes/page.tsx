import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FaqAccordion } from "@/components/FaqAccordion";
import { faq } from "@/content/faq";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description:
    "Resuelve tus dudas sobre esgrima: qué armas existen, qué material necesitas, precios de federación, edad para empezar y todo lo que necesitas saber para apuntarte.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

export default function PreguntasFrecuentes() {
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
        eyebrow="Resolvemos tus dudas"
        title="Preguntas Frecuentes"
        lede="Si la esgrima te llama la atención, seguro que te surgen dudas. Aquí tienes respuestas claras a las preguntas que más nos hacen. Si falta alguna, escríbenos."
        path="/preguntas-frecuentes"
      />
      <Section>
        <FaqAccordion items={faq} />
      </Section>
    </>
  );
}
