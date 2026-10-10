import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { MiAnuncio } from "@/components/MiAnuncio";

export const metadata: Metadata = {
  title: "Mi anuncio del mercadillo",
  robots: { index: false, follow: false },
  alternates: { canonical: "/mercadillo/mi-anuncio" },
};

export default function MiAnuncioPage() {
  return (
    <>
      <PageHero path="/mercadillo/mi-anuncio" eyebrow="Mercadillo" title="Mi anuncio" lede="Gestiona tu anuncio con el enlace privado que te enviamos por correo." />
      <Section>
        <MiAnuncio />
      </Section>
    </>
  );
}
