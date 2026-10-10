import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { Section, SectionHeading } from "@/components/Section";
import { localizedGalleryPhoto } from "@/content/gallery";
import { whatsappLink } from "@/content/site";
import { pageAlternates } from "@/content/i18n";
import { enClaseGratisSteps, enPageText } from "@/content/en";

export const metadata: Metadata = {
  title: "Try a Free Class",
  description:
    "Try your first fencing class for free at Club de Esgrima Torremolinos. No commitment, and a sabre in your hand from day one.",
  alternates: pageAlternates("/en/free-trial-class"),
};

export default function FreeTrialClass() {
  const hero = enPageText("/en/free-trial-class");
  const steps = enClaseGratisSteps().map((s) => ({
    ...s,
    photo: localizedGalleryPhoto(s.photo, "en"),
  }));
  const intro = localizedGalleryPhoto("equipo-esgrimistas-club-torremolinos-competicion", "en");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/en/free-trial-class"
        lang="en"
      />

      <Section>
        <Photo
          src={intro.src}
          alt={intro.alt}
          width={intro.width}
          height={intro.height}
          className="mb-10 aspect-[16/9] w-full rounded-sm border border-line object-cover object-[center_40%]"
        />
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
            <p>
              All you need to bring is sports clothes and shoes, a bottle of water, a towel and
              plenty of enthusiasm to learn. We take care of the rest.
            </p>
            <p>
              Whatever you may have seen on television, fencing is, above all, a sport. You
              sweat, you run and you think fast, and everything new you learn, you train with
              your body. Forget dukes, wealthy aristocrats and challenging someone to a duel by
              slapping them with a glove.
            </p>
          </div>
          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <p className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              Still not sure?
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Take a look at our 2-for-1 offer. Bring someone along and, if you both sign up,
              your monthly fee is free.
            </p>
            <a
              href={whatsappLink("Hello, I'd like to book a free class")}
              className="mt-4 inline-flex items-center rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
            >
              Book a free class
            </a>
          </div>
        </div>
      </Section>

      <Section tone="raised" className="border-t border-line">
        <SectionHeading eyebrow="How it works" title="Your first class, step by step" />
        <ol className="relative mx-auto max-w-3xl">
          <span
            aria-hidden="true"
            className="absolute bottom-4 left-5 top-4 w-px -translate-x-1/2 bg-gradient-to-b from-accent via-steel to-line"
          />
          {steps.map((s, i) => (
            <li key={s.title} className="reveal relative pb-8 pl-14 last:pb-0 md:pl-16">
              <span className="absolute left-5 top-5 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-accent bg-paper-raised font-mono text-sm font-bold text-accent">
                {i + 1}
              </span>
              <div className="overflow-hidden rounded-sm border border-line bg-paper">
                <div className="p-5 md:p-6">
                  <p className="font-mono text-xs uppercase tracking-widest text-steel">
                    Step {i + 1} of {steps.length}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold uppercase tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                </div>
                <Photo
                  src={s.photo.src}
                  alt={s.photo.alt}
                  width={s.photo.width}
                  height={s.photo.height}
                  className="aspect-[16/9] w-full border-t border-line object-cover object-[center_30%] md:aspect-[2/1]"
                />
              </div>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-8 max-w-3xl pl-14 text-sm font-semibold text-ink md:pl-16">
          And yes: you pick up a sabre and start fencing on day one.
        </p>
      </Section>
    </>
  );
}
