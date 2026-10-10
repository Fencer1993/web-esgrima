import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { NewsCard } from "@/components/NewsCard";
import { NewsList } from "@/components/NewsList";
import { pageAlternates } from "@/content/i18n";
import { enPageText } from "@/content/en";
import { allNews, newsTypeEn, newsTypes } from "@/content/news";

export const metadata: Metadata = {
  title: "News and Notices",
  description:
    "News, notices and call-ups from Club de Esgrima Torremolinos: the latest from the club.",
  alternates: pageAlternates("/en/news"),
};

export default function NewsEn() {
  const hero = enPageText("/en/news");
  const types = newsTypes.filter((t) => allNews.some((n) => n.type === t));
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/en/news"
        lang="en"
      />
      <Section>
        {allNews.length === 0 ? (
          <p className="text-ink-soft">There are no posts yet. Please check back soon.</p>
        ) : (
          <NewsList
            lang="en"
            types={types}
            typeLabels={newsTypeEn}
            entries={allNews.map((n) => ({
              type: n.type,
              node: <NewsCard item={n} lang="en" />,
            }))}
          />
        )}
      </Section>
    </>
  );
}
