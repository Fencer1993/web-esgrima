import { athletes } from "@/content/athletes";

export function AthleteGrid() {
  if (athletes.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line bg-paper-raised px-6 py-10 text-center">
        <p className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
          Próximamente
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Aquí presentaremos a los deportistas del club, con su foto y palmarés. Vuelve
          pronto.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {athletes.map((a) => (
        <div
          key={a.name}
          className="group overflow-hidden rounded-sm border border-line bg-paper-raised transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg"
        >
          <div className="flex aspect-square items-center justify-center bg-steel-soft">
            {a.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.photo} alt={a.name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-4xl font-bold text-steel">
                {a.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>
          <div className="p-5">
            <h4 className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
              {a.name}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{a.achievement}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
