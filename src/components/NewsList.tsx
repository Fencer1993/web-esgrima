"use client";

import { useState, type ReactNode } from "react";

// Recibe las tarjetas ya renderizadas (servidor) y solo filtra por tipo.
export function NewsList({
  types,
  entries,
}: {
  types: string[];
  entries: { type: string; node: ReactNode }[];
}) {
  const [active, setActive] = useState<string>("Todas");
  const visible = active === "Todas" ? entries : entries.filter((e) => e.type === active);
  const chips = ["Todas", ...types];

  return (
    <div>
      <div role="group" aria-label="Filtrar por tipo" className="mb-8 flex flex-wrap gap-2">
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
      {visible.length === 0 ? (
        <p className="text-ink-soft">No hay publicaciones de este tipo todavía.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e, i) => (
            <li key={i}>{e.node}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
