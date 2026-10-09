import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { ShopOrderForm } from "@/components/ShopOrderForm";
import { productsByCategory, shopIntro, shopProducts } from "@/content/shop";

export const metadata: Metadata = {
  title: "Tienda del club",
  description:
    "Material de esgrima para socios del Club de Esgrima Torremolinos: pide a través del club con asesoramiento, pequeño descuento y sin gastos de envío.",
  alternates: { canonical: "/tienda" },
};

export default function Tienda() {
  const groups = productsByCategory();
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

        <div className="mt-12 space-y-14">
          {groups.map((g) => (
            <div key={g.category}>
              <SectionHeading title={g.category} />
              <ul className="-mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-col overflow-hidden rounded-sm border border-line bg-paper-raised"
                  >
                    {p.photo ? (
                      <Photo
                        src={p.photo}
                        alt={p.name}
                        width={600}
                        height={450}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="flex aspect-[4/3] w-full items-center justify-center bg-accent-soft text-accent-dark"
                      >
                        <svg
                          width="56"
                          height="56"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 20L18 6" />
                          <path d="M15 3l6 6" />
                          <path d="M6 14l4 4" />
                          <path d="M3 21l2-2" />
                        </svg>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                        {p.supplier}
                        {p.ref ? ` · Ref. ${p.ref}` : ""}
                      </p>
                      <h3 className="mt-1 text-xl font-bold uppercase tracking-tight text-ink">
                        {p.name}
                      </h3>
                      <p className="mt-2 text-sm text-ink-soft">{p.description}</p>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-touche mt-2 self-start text-xs font-semibold text-accent-dark"
                        >
                          Ver ficha y tallas en {p.supplier} →
                        </a>
                      )}
                      <div className="mt-auto pt-4">
                        {p.sizes.length > 0 && (
                          <p className="text-xs text-ink-faint">
                            Tallas: {p.sizes.join(", ")}
                          </p>
                        )}
                        <p className="mt-1 text-lg font-bold text-ink">{p.price}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="raised">
        <div id="pedido" className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Solicitud de pedido"
            title="Haz tu pedido"
            lede="Esto es una solicitud: el club agrupa los pedidos y te avisa del importe antes de pedirlo al proveedor."
          />
          <ShopOrderForm
            products={shopProducts.map((p) => ({
              id: p.id,
              name: p.name,
              supplier: p.supplier,
              sizes: p.sizes,
            }))}
          />
        </div>
      </Section>
    </>
  );
}
