import Link from "next/link";
import { formatNewsDate, formatNewsDateEn, newsTypeEn, type NewsItem } from "@/content/news";
import type { Lang } from "@/content/i18n";
import { Photo } from "./Photo";

export function NewsCard({ item, lang = "es" }: { item: NewsItem; lang?: Lang }) {
  const isEn = lang === "en";
  // En inglés, sin traducción se muestra el texto español marcado como tal.
  const spanishOnly = isEn && !item.en;
  const title = isEn && item.en ? item.en.title : item.title;
  const summary = isEn && item.en ? item.en.summary : item.summary;
  return (
    <article className="reveal group relative flex h-full flex-col overflow-hidden rounded-sm border border-line bg-paper transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg">
      {item.image && (
        <div className="aspect-[16/10] overflow-hidden bg-paper-raised">
          <Photo
            src={item.image.src}
            alt=""
            width={item.image.width}
            height={item.image.height}
            className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-sm bg-accent-soft px-2 py-1 font-mono uppercase tracking-[0.12em] text-accent-dark">
            {isEn ? newsTypeEn[item.type] : item.type}
          </span>
          <time dateTime={item.date} className="text-ink-faint">
            {isEn ? formatNewsDateEn(item.date) : formatNewsDate(item.date)}
          </time>
          {item.pinned && (
            <span className="font-mono uppercase tracking-[0.12em] text-steel">
              {isEn ? "Featured" : "Destacada"}
            </span>
          )}
          {spanishOnly && <span className="text-ink-faint">(in Spanish)</span>}
        </div>
        <h3
          {...(spanishOnly ? { lang: "es" } : {})}
          className="mt-3 text-xl font-bold uppercase tracking-tight text-ink"
        >
          <Link
            href={isEn ? `/en/news/${item.slug}` : `/noticias/${item.slug}`}
            className="after:absolute after:inset-0 hover:text-accent-dark"
          >
            {title}
          </Link>
        </h3>
        <p
          {...(spanishOnly ? { lang: "es" } : {})}
          className="mt-2 text-sm leading-relaxed text-ink-soft"
        >
          {summary}
        </p>
        <span className="mt-4 text-sm font-semibold uppercase tracking-wide text-accent-dark">
          {isEn ? "Read more" : "Leer más"}
        </span>
      </div>
    </article>
  );
}
