export function PageHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-line bg-ink text-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 origin-top-right skew-x-[-12deg] bg-steel/40"
      />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-20">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 max-w-3xl text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          {title}
        </h1>
        {lede && <p className="mt-4 max-w-xl text-base text-paper/75">{lede}</p>}
      </div>
    </div>
  );
}
