import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Mercadillo } from "@/components/Mercadillo";
import mercadillo from "@/content/data/mercadillo.json";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Mercadillo de segunda mano",
  description:
    "Compra, vende o busca material de esgrima de segunda mano entre socios y familias del Club de Esgrima Torremolinos.",
  alternates: { canonical: "/mercadillo" },
};

export default function MercadilloPage() {
  return (
    <>
      <PageHero
        path="/mercadillo"
        eyebrow="Segunda mano"
        title="Mercadillo"
        lede="Material de esgrima que ya no usas, o que te hace falta, entre socios y familias del club."
      />
      <Section>
        <Mercadillo
          config={{ tipos: mercadillo.tipos, estados: mercadillo.estados, manos: mercadillo.manos }}
          intro={mercadillo.intro}
          aviso={mercadillo.aviso}
          clubName={site.name}
        />
      </Section>
    </>
  );
}
