"use client";

import { useState } from "react";
import { galleryItems, type GalleryCategory } from "@/content/gallery";

const filters: Array<GalleryCategory | "Todo"> = ["Todo", "Entrenamientos", "Competiciones"];

export function Gallery() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todo");
  const items = filter === "Todo" ? galleryItems : galleryItems.filter((i) => i.category === filter);

  return (
    <div>
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              filter === f
                ? "bg-ink text-paper"
                : "border border-line text-ink-soft hover:border-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <figure
            key={item.caption}
            className="flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-sm border border-line bg-steel-soft p-4"
          >
            <span className="mb-2 font-mono text-[10px] uppercase tracking-wide text-steel">
              {item.category}
            </span>
            <figcaption className="text-sm leading-snug text-ink-soft">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
