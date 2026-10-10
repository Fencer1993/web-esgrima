import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { AthleteGrid } from "@/components/AthleteGrid";
import { Photo } from "@/components/Photo";
import { CoachCard } from "@/components/CoachCard";
import { localizedGalleryPhoto } from "@/content/gallery";
import { pageAlternates } from "@/content/i18n";
import { enCoaches, enPageText } from "@/content/en";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the coaches and athletes of Club de Esgrima Torremolinos: who will teach you in class and who represents us in competition.",
  alternates: pageAlternates("/en/our-team"),
};

export default function OurTeam() {
  const hero = enPageText("/en/our-team");
  const group = localizedGalleryPhoto("grupo-esgrimistas-club-torremolinos-sala-ayuntamiento", "en");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/en/our-team"
        lang="en"
      />

      <section className="relative overflow-hidden bg-ink text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 -skew-x-12 bg-steel/25"
        />
        <div className="relative mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:grid-cols-3 sm:py-10">
          {[
            ["Sabre", "Our speciality in standing fencing"],
            ["All ages", "From children to adults"],
            ["Adapted fencing", "In a wheelchair"],
          ].map(([big, small]) => (
            <div key={big} className="reveal border-l-2 border-accent pl-4">
              <p className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                {big}
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-paper/70">
                {small}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="Coaches"
          title="Who will teach you"
          lede="They are qualified to coach all three weapons. In standing fencing we specialise in sabre; in adapted fencing we work with all three."
        />
        <div className="reveal mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {enCoaches().map((c) => (
            <CoachCard key={c.name} coach={c} />
          ))}
        </div>
      </Section>

      <Section tone="raised" className="border-t-4 border-t-accent">
        <SectionHeading
          eyebrow="Athletes"
          title="In competition"
          lede="Some of the fencers who have competed most for the club and who have won medals and honours in tournaments. They are not everyone on the team: every member who trains with us counts, whether they compete or not, and the list is renewed every season."
        />
        <Photo
          src={group.src}
          alt={group.alt}
          width={group.width}
          height={group.height}
          className="aspect-[16/9] w-full rounded-sm border border-line object-cover object-[center_45%]"
        />
        <div aria-hidden className="mx-auto my-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="h-2 w-2 rotate-45 bg-accent" />
          <span className="h-px flex-1 bg-line" />
        </div>
        <AthleteGrid lang="en" />
      </Section>
    </>
  );
}
