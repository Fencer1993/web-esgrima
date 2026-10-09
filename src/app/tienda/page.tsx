import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { ShopApp } from "@/components/ShopApp";
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
        <p className="mb-8 max-w-2xl text-base text-ink-soft">{shopIntro}</p>
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
