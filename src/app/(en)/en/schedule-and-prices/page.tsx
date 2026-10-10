import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { whatsappLink } from "@/content/site";
import { PricingScheduleCard } from "@/components/PricingScheduleCard";
import { CompetitionPromo } from "@/components/CompetitionPromo";
import { pageAlternates } from "@/content/i18n";
import {
  enBonos,
  enFederationFees,
  enPageText,
  enPlans,
  enSchedule,
} from "@/content/en";

export const metadata: Metadata = {
  title: "Schedule and Prices",
  description:
    "Fencing schedules for children, adults and wheelchair fencers in Torremolinos, plus performance training on Mondays. Fees from €30 a month, passes and equipment included.",
  alternates: pageAlternates("/en/schedule-and-prices"),
};

export default function ScheduleAndPrices() {
  const hero = enPageText("/en/schedule-and-prices");
  const schedule = enSchedule();
  const plans = enPlans();
  const bonos = enBonos();
  const federationFees = enFederationFees();
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/en/schedule-and-prices"
        lang="en"
      />

      <Section>
        <SectionHeading eyebrow="When we train" title="Schedule" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schedule.map((s) => (
            <PricingScheduleCard
              key={s.group}
              lang="en"
              group={s.group}
              days={s.days}
              daysSource={s.daysSource}
              hours={s.hours}
              note={s.note}
            />
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-ink-soft">
          You surely know someone who fancies picking up a sabre. Nobody here learns to turn
          anyone into a sieve, but you will have just as much fun.{" "}
          <a
            href={whatsappLink("Hello, I'd like some more information about the schedule")}
            className="font-semibold text-accent underline underline-offset-4"
          >
            Message us and we will tell you more
          </a>
          .
        </p>
      </Section>

      <CompetitionPromo lang="en" />

      <Section tone="raised" className="border-y border-line">
        <SectionHeading eyebrow="Monthly fees" title="Prices" />
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className="reveal group relative flex flex-col overflow-hidden rounded-sm border border-line bg-paper-raised p-6 transition duration-200 hover:-translate-y-1 hover:border-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 origin-left bg-accent"
              />
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold uppercase tracking-tight text-ink">
                  {p.name}
                </h3>
                {p.features.some((f) => /equipment/i.test(f)) && (
                  <span className="shrink-0 rounded-sm bg-accent-soft px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-accent-dark">
                    Equipment included
                  </span>
                )}
              </div>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold tabular text-accent">
                  {p.price}
                </span>
                <span className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                  {p.period}
                </span>
              </p>
              <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm text-ink-soft">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden className="text-accent">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-ink">
            Or save with a pass
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {bonos.map((b) => (
              <div
                key={b.name}
                className="reveal relative overflow-hidden rounded-sm bg-ink p-6 text-paper transition duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 top-0 h-full w-1/3 -skew-x-12 bg-steel/25"
                />
                <div className="relative">
                  <p className="inline-block rounded-sm bg-accent px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-white">
                    {b.note}
                  </p>
                  <p className="mt-3 font-semibold uppercase tracking-tight">{b.name}</p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <p className="font-display text-5xl font-bold tabular">{b.price}</p>
                    <p className="font-mono text-sm tabular text-paper/75">{b.childPrice}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Before you start" title="Equipment hire" />
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          You don&rsquo;t need to buy anything to get started: we provide all the equipment. We
          know that at the beginning you can&rsquo;t be sure whether you will like fencing, so we
          lend it to you for free on your first day and for the first month after you join. After
          that, you can build up your own kit little by little. Hired equipment stays at the
          club, so you don&rsquo;t have to carry it home.
        </p>
      </Section>

      <Section tone="raised" className="border-t border-line">
        <SectionHeading eyebrow="Required to compete" title="Federation insurance" />
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
          We are a club of the Andalusian Fencing Federation (FAE), so all our athletes must be
          insured when they join the club. The insurance covers you for accidents while training
          or competing, and entitles you to take part in regional competition and the Andalusian
          Championship. The fees are set by the Andalusian Fencing Federation:
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {federationFees.map((f) => (
            <div
              key={f.label}
              className="reveal flex flex-col justify-between gap-3 rounded-sm border border-line bg-paper-raised p-4 transition-colors hover:border-accent"
            >
              <span className="text-sm text-ink-soft">{f.label}</span>
              <span className="font-display text-3xl font-bold tabular text-ink">
                {f.price}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
