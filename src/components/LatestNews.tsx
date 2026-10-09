import Link from "next/link";
import { Section, SectionHeading } from "./Section";
import { NewsCard } from "./NewsCard";
import { allNews } from "@/content/news";

export function LatestNews() {
  const latest = allNews.slice(0, 3);
  if (latest.length === 0) return null;
  return (
    <Section tone="raised" className="border-y border-line">
      <SectionHeading
        eyebrow="Tablón de anuncios"
        title="Lo último del club"
        lede="Noticias, avisos y convocatorias."
      />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {latest.map((n) => (
          <li key={n.slug}>
            <NewsCard item={n} />
          </li>
        ))}
      </ul>
      <Link
        href="/noticias"
        className="link-touche mt-8 inline-block text-sm font-semibold uppercase tracking-wide text-accent-dark"
      >
        Ver todas las noticias →
      </Link>
    </Section>
  );
}
