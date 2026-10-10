import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Sin conexión",
  description: "No hay conexión a internet.",
  alternates: { canonical: "/offline" },
  robots: { index: false, follow: false },
};

// Páginas que el visitante suele haber abierto y que el service worker
// (public/sw.js) puede tener guardadas.
const links = [
  { href: "/", label: "Inicio" },
  { href: "/horarios-y-precios", label: "Horarios y precios" },
  { href: "/clase-gratis", label: "Clase gratis" },
  { href: "/contacto", label: "Contacto" },
];

export default function Offline() {
  return (
    <Section>
      <div className="max-w-2xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Sin conexión
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-tight tracking-tight text-ink sm:text-5xl">
          Ahora mismo no tienes internet
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink-soft">
          No hemos podido cargar esta página. Comprueba tu conexión e inténtalo de nuevo.
          Mientras tanto, puedes abrir las páginas que ya hayas visitado:
        </p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-flex rounded-sm border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent-dark"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-base text-ink-soft">
          ¿Necesitas hablar con nosotros? Llámanos al{" "}
          <a
            href={`tel:${site.contact.phoneDial}`}
            className="font-semibold text-ink underline underline-offset-4"
          >
            {site.contact.phone}
          </a>
          .
        </p>
      </div>
    </Section>
  );
}
