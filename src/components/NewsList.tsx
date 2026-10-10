"use client";

import { useState, type ReactNode } from "react";
import type { Lang } from "@/content/i18n";

// Recibe las tarjetas ya renderizadas (servidor) y solo filtra por tipo.
export function NewsList({
  types,
  entries,
  lang = "es",
  typeLabels = {},
}: {
  types: string[];
  entries: { type: string; node: ReactNode }[];
  lang?: Lang;
  /** Etiqueta mostrada de cada tipo (el valor interno sigue siendo el español). */
  typeLabels?: Record<string, string>;
}) {
  const [active, setActive] = useState<string>("Todas");
  const visible = active === "Todas" ? entries : entries.filter((e) => e.type === active);
  const chips = ["Todas", ...types];
  const label = (c: string) => (c === "Todas" ? (lang === "en" ? "All" : "Todas") : (typeLabels[c] ?? c));

  return (
    <div>
      <div role="group" aria-label={lang === "en" ? "Filter by type" : "Filtrar por tipo"} className="mb-8 flex flex-wrap gap-2">
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
            {label(c)}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-ink-soft">
          {lang === "en" ? "There are no posts of this type yet." : "No hay publicaciones de este tipo todavía."}
        </p>
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
