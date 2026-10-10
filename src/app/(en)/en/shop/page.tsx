import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { ShopApp } from "@/components/ShopApp";
import { SizeCalculator } from "@/components/SizeCalculator";
import { SizeGuide } from "@/components/SizeGuide";
import { pageAlternates } from "@/content/i18n";
import { enPageText } from "@/content/en";
import tiendaEn from "@/content/data/en/tienda.json";
import { activeCategories, shopProducts } from "@/content/shop";

export const metadata: Metadata = {
  title: "Club Shop",
  description:
    "Fencing equipment for members of Club de Esgrima Torremolinos: order through the club with expert advice, a small discount and no delivery charges.",
  alternates: pageAlternates("/en/shop"),
};

export default function ShopEn() {
  const hero = enPageText("/en/shop");
  return (
    <>
      <PageHero
        path="/en/shop"
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        lang="en"
      />

      <Section>
        <p className="max-w-2xl text-base text-ink-soft">{tiendaEn.intro}</p>
        <p className="mb-10 mt-4 flex flex-wrap gap-3">
          <a
            href="#catalogo"
            className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-accent-dark"
          >
            {tiendaEn.seeCatalogue}
          </a>
          <a
            href="#calculadora"
            className="inline-flex items-center gap-2 rounded-sm border border-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-dark hover:bg-accent-soft"
          >
            {tiendaEn.seeCalculator}
          </a>
          <a
            href="#guia-de-tallas"
            className="inline-flex items-center gap-2 rounded-sm border border-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-dark hover:bg-accent-soft"
          >
            {tiendaEn.seeSizeGuide}
          </a>
        </p>
        <div className="mb-10">
          <SizeCalculator lang="en" />
        </div>
        <div className="mb-14">
          <SizeGuide lang="en" />
        </div>
        <h2
          id="catalogo"
          className="mb-6 scroll-mt-24 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl"
        >
          {tiendaEn.catalogueTitle}
        </h2>
        {shopProducts.length === 0 ? (
          <p className="text-sm text-ink-soft">{tiendaEn.emptyCatalogue}</p>
        ) : (
          <ShopApp products={shopProducts} categories={activeCategories()} lang="en" />
        )}
      </Section>
    </>
  );
}
