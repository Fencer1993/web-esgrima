"use client";

import { useId, useState } from "react";
import type { FaqItem } from "@/content/faq";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const buttonId = `${baseId}-q-${i}`;
        const panelId = `${baseId}-a-${i}`;
        return (
          <div
            key={item.question}
            className={`border-l-4 transition-colors duration-300 motion-reduce:transition-none ${
              isOpen
                ? "border-l-accent bg-accent-soft/40"
                : "border-l-transparent hover:bg-paper-raised"
            }`}
          >
            <h3 className="m-0">
              <button
                type="button"
                id={buttonId}
                className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:px-6 sm:py-6"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xl leading-none transition-all duration-300 motion-reduce:transition-none ${
                    isOpen
                      ? "rotate-45 border-accent bg-accent text-paper"
                      : "border-line text-accent"
                  }`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl px-4 pb-6 text-sm leading-relaxed text-ink-soft sm:px-6 sm:text-base">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
