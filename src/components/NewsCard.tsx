import Link from "next/link";
import { formatNewsDate, type NewsItem } from "@/content/news";
import { Photo } from "./Photo";

export function NewsCard({ item }: { item: NewsItem }) {
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
            {item.type}
          </span>
          <time dateTime={item.date} className="text-ink-faint">
            {formatNewsDate(item.date)}
          </time>
          {item.pinned && (
            <span className="font-mono uppercase tracking-[0.12em] text-steel">Destacada</span>
          )}
        </div>
        <h3 className="mt-3 text-xl font-bold uppercase tracking-tight text-ink">
          <Link
            href={`/noticias/${item.slug}`}
            className="after:absolute after:inset-0 hover:text-accent-dark"
          >
            {item.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.summary}</p>
        <span className="mt-4 text-sm font-semibold uppercase tracking-wide text-accent-dark">
          Leer más
        </span>
      </div>
    </article>
  );
}
