import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FaqAccordion } from "@/components/FaqAccordion";
import { pageAlternates } from "@/content/i18n";
import { enFaq, enPageText } from "@/content/en";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to your questions about fencing: which weapons there are, what equipment you need, federation fees, the right age to start and everything you need to know before joining.",
  alternates: pageAlternates("/en/faq"),
};

export default function FaqEn() {
  const hero = enPageText("/en/faq");
  const faq = enFaq();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en",
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
        path="/en/faq"
        lang="en"
      />
      <Section>
        <FaqAccordion items={faq} />
      </Section>
    </>
  );
}
