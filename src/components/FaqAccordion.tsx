"use client";

import { useState } from "react";
import type { FaqItem } from "@/content/faq";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <span className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
                {item.question}
              </span>
              <span
                aria-hidden
                className={`shrink-0 font-mono text-xl text-accent transition-transform ${isOpen ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="max-w-3xl pb-5 text-sm leading-relaxed text-ink-soft">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
