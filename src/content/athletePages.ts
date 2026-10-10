import "server-only";
import { athletes, type Athlete } from "./athletes";
import { countMedals, resultsForAthlete, type AthleteEntry, type MedalCount } from "./results";

export type AthleteProfile = Athlete & {
  entries: AthleteEntry[];
  medals: MedalCount;
  hasPage: boolean;
};

// Solo tienen página propia los deportistas con algún resultado o con
// una biografía escrita; el resto aparece solo en la cuadrícula del equipo.
export const athleteProfiles: AthleteProfile[] = athletes.map((a) => {
  const entries = resultsForAthlete(a.name);
  return {
    ...a,
    entries,
    medals: countMedals(entries.map((e) => e.result)),
    hasPage: entries.length > 0 || Boolean(a.bio),
  };
});

export const athletesWithPage = athleteProfiles.filter((a) => a.hasPage);

export function athleteBySlug(slug: string): AthleteProfile | undefined {
  return athletesWithPage.find((a) => a.slug === slug);
}
