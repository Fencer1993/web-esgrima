import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { NewsCard } from "@/components/NewsCard";
import { NewsList } from "@/components/NewsList";
import { allNews, newsTypes } from "@/content/news";

export const metadata: Metadata = {
  title: "Tablón de anuncios",
  description:
    "Noticias, avisos y convocatorias del Club de Esgrima Torremolinos: lo último que pasa en el club.",
  alternates: { canonical: "/noticias" },
};

export default function Noticias() {
  const types = newsTypes.filter((t) => allNews.some((n) => n.type === t));
  return (
    <>
      <PageHero
        eyebrow="Tablón de anuncios"
        title="Noticias y avisos"
        lede="Lo último del club: noticias, avisos y convocatorias."
        path="/noticias"
      />
      <Section>
        {allNews.length === 0 ? (
          <p className="text-ink-soft">Aún no hay publicaciones. Vuelve pronto.</p>
        ) : (
          <NewsList
            types={types}
            entries={allNews.map((n) => ({
              type: n.type,
              node: <NewsCard item={n} />,
            }))}
          />
        )}
      </Section>
    </>
  );
}
