import Link from "next/link";
import { Photo } from "@/components/Photo";
import { MedalCounts } from "@/components/MedalBadge";
import { athleteProfiles } from "@/content/athletePages";

export function AthleteGrid() {
  if (athleteProfiles.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line bg-paper-raised px-6 py-10 text-center">
        <p className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
          Próximamente
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Aquí presentaremos a los deportistas del club, con su foto y palmarés.
          Vuelve pronto.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {athleteProfiles.map((a) => (
        <div
          key={a.name}
          className="group relative overflow-hidden rounded-sm border border-line bg-paper-raised transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg"
        >
          <div className="flex aspect-square items-center justify-center bg-steel-soft">
            {a.photo ? (
              <Photo
                src={a.photo.src}
                alt={`${a.name}, deportista del Club de Esgrima Torremolinos`}
                width={a.photo.width}
                height={a.photo.height}
                className="h-full w-full object-cover object-[center_30%]"
              />
            ) : (
              <span className="font-display text-5xl font-bold text-steel">
                {a.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>
          <div className="p-4">
            <h4 className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
              {a.hasPage ? (
                <Link
                  href={`/deportistas/${a.slug}`}
                  className="after:absolute after:inset-0 hover:text-accent-dark"
                >
                  {a.name}
                </Link>
              ) : (
                a.name
              )}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {a.achievement || "Deportista del club"}
            </p>
            {a.entries.length > 0 && (
              <div className="mt-3">
                <MedalCounts {...a.medals} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
