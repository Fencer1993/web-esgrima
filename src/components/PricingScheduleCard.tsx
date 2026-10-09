// Tarjeta de horario de un grupo: nombre, chips de días (L M X J V S D) y
// hora en grande. Los días se derivan del texto de `pricing.ts`.
const DAYS = [
  { key: "lunes", short: "L" },
  { key: "martes", short: "M" },
  { key: "miercoles", short: "X" },
  { key: "jueves", short: "J" },
  { key: "viernes", short: "V" },
  { key: "sabado", short: "S" },
  { key: "domingo", short: "D" },
] as const;

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Devuelve los índices (0 = lunes) mencionados en el texto. Entiende listas
// ("martes y jueves") y rangos ("de martes a viernes").
export function parseDays(text: string): Set<number> {
  const t = normalize(text);
  const names = DAYS.map((d) => d.key).join("|");
  const active = new Set<number>();
  const range = new RegExp(`(${names})\\s+a\\s+(${names})`, "g");
  for (const m of t.matchAll(range)) {
    const from = DAYS.findIndex((d) => d.key === m[1]);
    const to = DAYS.findIndex((d) => d.key === m[2]);
    for (let i = from; i <= to; i++) active.add(i);
  }
  DAYS.forEach((d, i) => {
    if (t.includes(d.key)) active.add(i);
  });
  return active;
}

export function PricingScheduleCard({
  group,
  days,
  hours,
}: {
  group: string;
  days: string;
  hours: string;
}) {
  const active = parseDays(days);
  const visible = DAYS.map((d, i) => ({ ...d, i })).filter(
    (d) => d.i < 5 || active.has(d.i),
  );
  return (
    <div className="reveal group flex h-full flex-col rounded-sm border border-line bg-paper-raised p-5 transition duration-200 hover:-translate-y-1 hover:border-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <h3 className="text-base font-semibold uppercase leading-snug tracking-tight text-ink">
        {group}
      </h3>
      <p className="mt-3 font-display text-3xl font-bold tabular text-ink sm:text-4xl">
        {hours}
      </p>
      {active.size > 0 ? (
        <>
          <ul aria-hidden className="mt-4 flex gap-1.5">
            {visible.map((d) => (
              <li
                key={d.key}
                className={`flex h-8 w-8 items-center justify-center rounded-sm font-mono text-xs font-semibold ${
                  active.has(d.i)
                    ? "bg-accent text-white"
                    : "border border-line text-ink-faint"
                }`}
              >
                {d.short}
              </li>
            ))}
          </ul>
          <p className="mt-2 font-mono text-xs uppercase tracking-wide text-ink-faint">
            {days}
          </p>
        </>
      ) : (
        <p className="mt-4 font-mono text-xs uppercase tracking-wide text-ink-faint">
          {days}
        </p>
      )}
    </div>
  );
}
