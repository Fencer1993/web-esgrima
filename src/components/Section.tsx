import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "raised";
}) {
  const bg = tone === "raised" ? "bg-paper-raised" : "bg-paper";
  return (
    <section className={`${bg} ${className}`}>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {lede && <p className="mt-3 text-base text-ink-soft">{lede}</p>}
    </div>
  );
}
