import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { allNews, formatNewsDate, newsBySlug } from "@/content/news";
import { site } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return allNews.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = newsBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/noticias/${item.slug}` },
  };
}

export default async function Noticia({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = newsBySlug(slug);
  if (!item) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.summary,
    datePublished: item.date,
    inLanguage: "es",
    mainEntityOfPage: `${site.url}/noticias/${item.slug}`,
    ...(item.image ? { image: [`${site.url}${item.image.src}`] } : {}),
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };

  return (
    <>
      <PageHero
        eyebrow={item.type}
        title={item.title}
        lede={formatNewsDate(item.date)}
        path={`/noticias/${item.slug}`}
      />
      <Section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="reveal mx-auto max-w-2xl">
          <p className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-sm bg-accent-soft px-2 py-1 font-mono uppercase tracking-[0.12em] text-accent-dark">
              {item.type}
            </span>
            <time dateTime={item.date} className="text-ink-faint">
              {formatNewsDate(item.date)}
            </time>
          </p>
          {item.image && (
            <Photo
              src={item.image.src}
              alt=""
              width={item.image.width}
              height={item.image.height}
              className="mt-6 h-auto w-full rounded-sm border border-line"
            />
          )}
          <div className="mt-8 space-y-4 leading-relaxed text-ink-soft">
            {item.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Link
            href="/noticias"
            className="link-touche mt-10 inline-block text-sm font-semibold uppercase tracking-wide text-accent-dark"
          >
            ← Volver al tablón
          </Link>
        </article>
      </Section>
    </>
  );
}
