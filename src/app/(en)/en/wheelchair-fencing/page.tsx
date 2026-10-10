import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { PhotoRow } from "@/components/PhotoRow";
import { FaqAccordion } from "@/components/FaqAccordion";
import { whatsappLink } from "@/content/site";
import { localizedGalleryPhoto } from "@/content/gallery";
import { pageAlternates } from "@/content/i18n";
import { enFaqSilla, enPageText, enWheelchairSchedule } from "@/content/en";

export const metadata: Metadata = {
  title: "Wheelchair Fencing",
  description:
    "Club de Esgrima Torremolinos is the only club in Andalusia with wheelchair fencing. Adapted, inclusive sport, coached by a national team coach.",
  alternates: pageAlternates("/en/wheelchair-fencing"),
};

export default function WheelchairFencing() {
  const hero = enPageText("/en/wheelchair-fencing");
  const faq = enFaqSilla();
  const when = enWheelchairSchedule();
  const photo = localizedGalleryPhoto("esgrimista-silla-de-ruedas-competicion-torremolinos", "en");
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
        path="/en/wheelchair-fencing"
        lang="en"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
            <p>
              In Torremolinos we train wheelchair fencing under Carlos Soler, national coach for
              this discipline, so you will have the best coach teaching you. It is designed for
              people whose mobility is reduced for various reasons: paraplegia, tetraplegia or
              other conditions that limit or prevent movement of the lower body.
            </p>
            <p>
              Fencing here is genuinely inclusive: the club welcomes both standing fencers and
              people with a physical disability, and we hold friendly competitions in which both
              take part on equal terms. The discipline works for recreation and for competing:
              we have athletes with extensive international records, such as Carlos Soler
              himself, Antonio Garrido and Lorenzo Ribes.
            </p>
            <p>
              You can learn all three weapons, épée, foil and sabre, and discover how fast a bout
              feels from a wheelchair.
            </p>
          </div>

          <div className="space-y-6">
            <Photo
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className="aspect-[4/5] w-full rounded-sm border border-line object-cover object-[center_40%]"
            />
            <div className="rounded-sm border border-line bg-paper-raised p-6">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                    Schedule
                  </dt>
                  <dd className="mt-1 text-ink">
                    {when.days}, {when.hours.replace(/\s/g, "")}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                    Monthly fee
                  </dt>
                  {/* Mismo dato que la página española (importes fijos en su page.tsx). */}
                  <dd className="mt-1 tabular text-ink">
                    €30/month, including the 2-for-1 offer and the free trial
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                    Federation insurance (FEDDF)
                  </dt>
                  <dd className="mt-1 tabular text-ink">€70/year</dd>
                </div>
              </dl>
              <a
                href={whatsappLink("Hello, I'd like some information about wheelchair fencing")}
                className="mt-6 inline-flex w-full items-center justify-center rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
              >
                Contact Carlos Soler
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <PhotoRow feature lang="en" names={["podio-esgrima-adaptada-torneo-jaen"]} />
        </div>
      </Section>

      <Section tone="raised" className="border-t border-line">
        <SectionHeading eyebrow="Common questions" title="Adapted Fencing: Questions" />
        <FaqAccordion items={faq} />
      </Section>
    </>
  );
}
