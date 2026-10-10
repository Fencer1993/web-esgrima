import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { PhotoRow } from "@/components/PhotoRow";
import { whatsappLink } from "@/content/site";
import { pageAlternates } from "@/content/i18n";
import { enCompetitionGroups, enPageText } from "@/content/en";

export const metadata: Metadata = {
  title: "Fencing for Adults",
  description:
    "Fencing classes for teenagers from 13 and adults in Torremolinos. Recreational fencing or competition fencing: you choose the level.",
  alternates: pageAlternates("/en/fencing-for-adults"),
};

export default function FencingForAdults() {
  const hero = enPageText("/en/fencing-for-adults");
  const [teens, adults] = enCompetitionGroups();
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/en/fencing-for-adults"
        lang="en"
      />

      <Section>
        <div className="mb-10">
          <PhotoRow
            feature
            lang="en"
            names={[
              "grupo-esgrimistas-club-torremolinos-sala-ayuntamiento",
              "esgrimistas-adultos-club-torremolinos-torneo",
              "podio-absoluto-torneo-jaen-oro",
            ]}
          />
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          We offer fencing for adults and teenagers in Torremolinos, in a group that trains from
          Tuesday to Friday, plus a performance session on Mondays for anyone who wants to
          compete. We adapt the training to each person&rsquo;s age and level: there are people
          who have just started, people who compete at Andalusian or national level, and adults
          and veterans (30 and over) who come purely for the fun of it. And yes, there is
          competition for veterans too. The atmosphere is the kind that gets you hooked.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              Recreational Fencing
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              Want to enjoy yourself and keep moving? You train at your own pace, have friendly
              bouts just for the fun of it, and there is always room for good company.
            </p>
          </div>
          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
              Competition Fencing
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              Want to train and go out and compete? The limit is yours to set: individual
              lessons, federation competitions and advanced strategy. On Mondays there is
              performance training, from {teens.hours.replace(/\s/g, "")} for ages 13 to 18 and
              from {adults.hours.replace(/\s/g, "")} for over-18s.
            </p>
          </div>
        </div>

        <div className="mt-10 max-w-2xl space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            We like to teach through play, but we also have a proper training method for
            competing: general physical preparation for everyone and more specific work for
            those aiming at tournaments.
          </p>
          <p>
            Every session starts with a general and a specific warm-up, stretching and
            conditioning exercises, sometimes with fencing footwork. Then comes the technical and
            tactical work with sabres, jacket and gloves, always with safety first. After that,
            it is time to fence: directed or free bouts. If you have only been training for a
            short time, you will get individual lessons to help you find your feet. We finish
            with stretching to ease the aches.
          </p>
          <p>
            <Link
              href="/en/schedule-and-prices"
              className="font-semibold text-accent underline underline-offset-4"
            >
              See the schedule and monthly fee
            </Link>
            .
          </p>
        </div>
      </Section>

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
            href={whatsappLink("Hello, I'd like some information about fencing for adults")}
            className="rounded-sm border border-accent bg-accent p-6 text-white transition-colors hover:bg-accent-dark"
          >
            <p className="font-mono text-xs uppercase tracking-wide text-white/70">Convinced?</p>
            <p className="mt-2 font-display text-lg font-semibold uppercase tracking-tight">
              Get in touch
            </p>
          </a>
        </div>
      </Section>
    </>
  );
}
