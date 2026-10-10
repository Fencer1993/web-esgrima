"use client";

import { useState, type ReactNode } from "react";

// Recibe las tarjetas ya renderizadas (servidor), agrupadas por temporada,
// y solo filtra por nivel.
export function TournamentList({
  levels,
  seasons,
}: {
  levels: string[];
  seasons: { season: string; entries: { level: string; node: ReactNode }[] }[];
}) {
  const [active, setActive] = useState<string>("Todos");
  const chips = ["Todos", ...levels];
  const groups = seasons
    .map((s) => ({
      season: s.season,
      entries: active === "Todos" ? s.entries : s.entries.filter((e) => e.level === active),
    }))
    .filter((g) => g.entries.length > 0);

  return (
    <div>
      {levels.length > 1 && (
        <div role="group" aria-label="Filtrar por nivel" className="mb-8 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={active === c}
              onClick={() => setActive(c)}
              className={`rounded-sm border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                active === c
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink-soft hover:border-ink-soft"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-12">
        {groups.map((g) => (
          <section key={g.season} aria-labelledby={`temporada-${g.season}`}>
            <h3
              id={`temporada-${g.season}`}
              className="mb-5 border-l-2 border-accent pl-3 font-display text-2xl font-bold uppercase tracking-tight text-ink"
            >
              Temporada {g.season}
            </h3>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {g.entries.map((e, i) => (
                <li key={i}>{e.node}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
