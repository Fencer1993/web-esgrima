import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { PhotoRow } from "@/components/PhotoRow";
import { whatsappLink } from "@/content/site";
import { pageAlternates } from "@/content/i18n";
import { enPageText } from "@/content/en";

export const metadata: Metadata = {
  title: "Fencing for Kids",
  description:
    "Fencing classes for children from age 6 in Torremolinos. Qualified coaches, learning through play and safety first.",
  alternates: pageAlternates("/en/fencing-for-kids"),
};

export default function FencingForKids() {
  const hero = enPageText("/en/fencing-for-kids");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/en/fencing-for-kids"
        lang="en"
      />

      <Section>
        <div className="mb-10">
          <PhotoRow
            feature
            lang="en"
            names={[
              "equipo-infantil-juvenil-esgrima-torremolinos-almeria",
              "clase-grupal-esgrima-sala-club-torremolinos",
              "equipo-infantil-esgrima-torremolinos-competicion",
            ]}
          />
        </div>
        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            At Club de Esgrima Torremolinos we teach fencing to children from the age of 6, in
            small groups and with coaches who know how to work with the youngest. We chose that
            age so that everyone can play together and so that each class suits its stage: the
            groups are evenly matched, and we do it through play, of course.
          </p>
          <p>
            At this age, what works best is simply having fun. Technique, strategy and fitness
            arrive on their own when you are enjoying yourself, so for most of the hour they
            spend with us, they will be playing. Many leave without realising they have learned
            anything.
          </p>
          <h2 className="pt-4 font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Safety first
          </h2>
          <p>
            Children are very safe in our fencing exercises. In fact, fencing is even safer than
            badminton. When they are very small, they use foam or plastic weapons and plastic
            masks. As they grow a little and become more responsible, they move on to standard
            sabres, and that is when they really start to feel like proper fencers.
          </p>
          <p>
            If one day they catch the competition bug, they will need to get their own kit, as
            official competitions require specific equipment.
          </p>
          <p>
            <Link
              href="/en/schedule-and-prices"
              className="font-semibold text-accent underline underline-offset-4"
            >
              See the kids&rsquo; schedule and monthly fee
            </Link>
            .
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
          hrefLang="es"
          className="rounded-sm border border-line bg-paper-raised p-6 transition-colors hover:border-accent"
        >
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            Still not sure?
          </p>
          <p className="mt-2 font-display text-lg font-semibold uppercase tracking-tight text-ink">
            See the facilities (in Spanish)
          </p>
        </Link>
        <Link
          href="/en/faq"
          className="rounded-sm border border-line bg-paper-raised p-6 transition-colors hover:border-accent"
        >
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            Any questions?
          </p>
          <p className="mt-2 font-display text-lg font-semibold uppercase tracking-tight text-ink">
            Frequently Asked Questions
          </p>
        </Link>
        <a
          href={whatsappLink("Hello, I'd like some information about fencing for kids")}
          className="rounded-sm border border-accent bg-accent p-6 text-white transition-colors hover:bg-accent-dark"
        >
          <p className="font-mono text-xs uppercase tracking-wide text-white/70">Convinced?</p>
          <p className="mt-2 font-display text-lg font-semibold uppercase tracking-tight">
            Get in touch
          </p>
        </a>
      </div>
    </Section>
  );
}
