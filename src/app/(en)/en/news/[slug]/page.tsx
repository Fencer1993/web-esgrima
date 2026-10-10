import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { allNews, formatNewsDateEn, newsBySlug, newsTypeEn } from "@/content/news";
import { pageAlternates } from "@/content/i18n";
import { site } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  // Con "output: export" Next exige al menos una ruta: si aún no hay noticias
  // se genera un marcador que la página resuelve con notFound() (404).
  const params = allNews.map((n) => ({ slug: n.slug }));
  return params.length > 0 ? params : [{ slug: "_" }];
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
    title: item.en?.title ?? item.title,
    description: item.en?.summary ?? item.summary,
    alternates: pageAlternates(`/en/news/${item.slug}`),
  };
}

export default async function NewsArticleEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = newsBySlug(slug);
  if (!item) notFound();

  // Sin traducción se muestra el texto español, marcado con lang="es".
  const translated = Boolean(item.en);
  const title = item.en?.title ?? item.title;
  const summary = item.en?.summary ?? item.summary;
  const paragraphs = item.en?.paragraphs ?? item.paragraphs;
  const date = formatNewsDateEn(item.date);
  const esAttr = translated ? {} : { lang: "es" };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: summary,
    datePublished: item.date,
    inLanguage: translated ? "en" : "es",
    mainEntityOfPage: `${site.url}/en/news/${item.slug}`,
    ...(item.image ? { image: [`${site.url}${item.image.src}`] } : {}),
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };

  return (
    <>
      <PageHero
        eyebrow={newsTypeEn[item.type]}
        title={title}
        lede={date}
        path={`/en/news/${item.slug}`}
        lang="en"
      />
      <Section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="reveal mx-auto max-w-2xl">
          <p className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-sm bg-accent-soft px-2 py-1 font-mono uppercase tracking-[0.12em] text-accent-dark">
              {newsTypeEn[item.type]}
            </span>
            <time dateTime={item.date} className="text-ink-faint">
              {date}
            </time>
            {!translated && <span className="text-ink-faint">(in Spanish)</span>}
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
          <div {...esAttr} className="mt-8 space-y-4 leading-relaxed text-ink-soft">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Link
            href="/en/news"
            className="link-touche mt-10 inline-block text-sm font-semibold uppercase tracking-wide text-accent-dark"
          >
            ← Back to the notice board
          </Link>
        </article>
      </Section>
    </>
  );
}
