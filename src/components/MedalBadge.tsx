import { medalLabel, type Medal } from "@/content/results";

const styles: Record<Medal, string> = {
  oro: "bg-amber-100 text-amber-900 border-amber-300",
  plata: "bg-slate-100 text-slate-700 border-slate-300",
  bronce: "bg-orange-100 text-orange-900 border-orange-300",
};

export function MedalBadge({ medal }: { medal: Medal }) {
  return (
    <span
      className={`inline-block rounded-sm border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] ${styles[medal]}`}
    >
      {medalLabel[medal]}
    </span>
  );
}

export function MedalCounts({
  oro,
  plata,
  bronce,
}: {
  oro: number;
  plata: number;
  bronce: number;
}) {
  const items: [Medal, number][] = [
    ["oro", oro],
    ["plata", plata],
    ["bronce", bronce],
  ];
  return (
    <ul className="flex flex-wrap gap-2">
      {items
        .filter(([, n]) => n > 0)
        .map(([m, n]) => (
          <li key={m} className="flex items-center gap-1.5">
            <span className="font-display text-sm font-bold text-ink">{n}</span>
            <MedalBadge medal={m} />
          </li>
        ))}
    </ul>
  );
}
