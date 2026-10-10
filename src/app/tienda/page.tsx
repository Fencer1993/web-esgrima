import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { ShopApp } from "@/components/ShopApp";
import { SizeGuide } from "@/components/SizeGuide";
import { activeCategories, shopIntro, shopProducts } from "@/content/shop";

export const metadata: Metadata = {
  title: "Tienda del club",
  description:
    "Material de esgrima para socios del Club de Esgrima Torremolinos: pide a través del club con asesoramiento, pequeño descuento y sin gastos de envío.",
  alternates: { canonical: "/tienda" },
};

export default function Tienda() {
  return (
    <>
      <PageHero
        path="/tienda"
        eyebrow="Material"
        title="Tienda del club"
        lede="Pedidos agrupados de material de esgrima para socios, con asesoramiento y sin gastos de envío."
      />

      <Section>
        <p className="max-w-2xl text-base text-ink-soft">{shopIntro}</p>
        <p className="mb-10 mt-4 flex flex-wrap gap-3">
          <a
            href="#catalogo"
            className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-accent-dark"
          >
            Ver el catálogo ↓
          </a>
          <a
            href="#guia-de-tallas"
            className="inline-flex items-center gap-2 rounded-sm border border-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-dark hover:bg-accent-soft"
          >
            ¿No sabes tu talla? Cómo medirte ↓
          </a>
        </p>
        <div className="mb-14">
          <SizeGuide />
        </div>
        <h2 id="catalogo" className="mb-6 scroll-mt-24 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          Catálogo
        </h2>
        {shopProducts.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Ahora mismo no hay productos disponibles. Escríbenos y te ayudamos con tu pedido.
          </p>
        ) : (
          <ShopApp products={shopProducts} categories={activeCategories()} />
        )}
      </Section>
    </>
  );
}
