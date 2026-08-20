import Link from "next/link";
import { site } from "@/content/site";

export function PageHero({
  eyebrow,
  title,
  lede,
  path,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  path: string;
}) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
      { "@type": "ListItem", position: 2, name: title, item: `${site.url}${path}` },
    ],
  };

  return (
    <div className="relative overflow-hidden border-b border-line bg-ink text-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 origin-top-right skew-x-[-12deg] bg-steel/40"
      />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <nav aria-label="Ruta de navegación" className="mb-4 text-xs text-paper/50">
          <Link href="/" className="hover:text-paper/80">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-paper/70">{title}</span>
        </nav>
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
