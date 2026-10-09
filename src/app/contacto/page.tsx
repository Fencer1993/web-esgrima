import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { pageText } from "@/content/texts";
import { Section } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { galleryPhoto } from "@/content/gallery";
import { site, whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta con el Club de Esgrima Torremolinos. Ven a probar una clase gratis, escríbenos por WhatsApp o rellena el formulario. Te respondemos encantados.",
  alternates: { canonical: "/contacto" },
};

export default function Contacto() {
  const hero = pageText("/contacto");
  const photo = galleryPhoto("clase-grupal-esgrima-sala-club-torremolinos");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/contacto"
      />

      <section className="relative overflow-hidden bg-ink text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 -skew-x-12 bg-steel/25"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:py-12 md:flex-row md:items-center md:justify-between">
          <div className="reveal max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              La forma más rápida
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Manda un WhatsApp
            </h2>
            <p className="mt-3 text-base text-paper/80">
              Cuéntanos qué te gustaría saber por WhatsApp, deja tus datos en el formulario o
              escribe directamente a{" "}
              <a
                href={`mailto:${site.contact.email}`}
                className="link-touche font-semibold text-accent"
              >
                {site.contact.email}
              </a>
              . Estaremos encantados de atenderte.
            </p>
          </div>
          <a
            href={whatsappLink("Hola, quiero información sobre el club")}
            className="btn-blade reveal inline-flex shrink-0 items-center justify-center gap-3 rounded-sm bg-accent px-7 py-4 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
          >
            <IconWhatsapp />
            Escribir por WhatsApp
          </a>
        </div>
      </section>

      <Section>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MethodCard
            icon={<IconWhatsapp />}
            label="WhatsApp"
            value="Escríbenos"
            href={whatsappLink("Hola, quiero información sobre el club")}
          />
          <MethodCard
            icon={<IconPhone />}
            label="Teléfono"
            value={site.contact.phone}
            href={`tel:${site.contact.phoneDial}`}
          />
          <MethodCard
            icon={<IconMail />}
            label="Correo"
            value={site.contact.email}
            href={`mailto:${site.contact.email}`}
            breakAll
          />
          <MethodCard
            icon={<IconPin />}
            label="Dirección"
            value={`${site.address.line}, ${site.address.city}`}
            href={site.address.mapsUrl}
          />
        </ul>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="reveal">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Cómo llegar
            </p>
            <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-ink">
              Te esperamos en el Palacio de Deportes
            </h2>
            <div className="mt-6 overflow-hidden rounded-sm border border-line bg-paper-raised">
              <Photo
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="p-6">
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                      Dirección
                    </dt>
                    <dd className="mt-1 text-ink">
                      {site.address.venue}
                      <br />
                      {site.address.line}, {site.address.postalCode} {site.address.city}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                      Teléfono
                    </dt>
                    <dd className="mt-1 text-ink">
                      <a href={`tel:${site.contact.phoneDial}`}>{site.contact.phone}</a>
                    </dd>
                  </div>
                </dl>
                <a
                  href={site.address.mapsUrl}
                  className="btn-blade mt-6 inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-3 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-accent-dark"
                >
                  <IconPin />
                  Ver en Google Maps →
                </a>
              </div>
            </div>
          </div>

          <div className="reveal">
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}

function MethodCard({
  icon,
  label,
  value,
  href,
  breakAll,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  breakAll?: boolean;
}) {
  return (
    <li className="reveal">
      <a
        href={href}
        className="group flex h-full items-center gap-4 rounded-sm border border-line bg-paper-raised p-5 transition-colors hover:border-accent"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-dark transition-colors group-hover:bg-accent group-hover:text-white">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-xs uppercase tracking-wide text-ink-faint">
            {label}
          </span>
          <span
            className={`mt-1 block text-sm font-semibold text-ink ${breakAll ? "break-all" : ""}`}
          >
            {value}
          </span>
        </span>
      </a>
    </li>
  );
}

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

function IconWhatsapp() {
  return (
    <svg {...iconProps}>
      <path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.5L3 21z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2L9 8.5z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg {...iconProps}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg {...iconProps}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function ContactForm() {
  return (
    <form
      action="../contact.php"
      method="post"
      className="relative rounded-sm border border-line border-t-4 border-t-accent bg-paper-raised p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-2xl font-bold uppercase tracking-tight text-ink">
        Escríbenos para más información
      </h2>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px]"
      />
      <div className="mt-5 space-y-4">
        <Field label="Tu nombre" name="name" type="text" required />
        <Field label="Tu correo electrónico" name="email" type="email" required />
        <Field label="Tu teléfono (opcional)" name="phone" type="tel" />
        <Field label="Asunto" name="subject" type="text" />
        <div>
          <label htmlFor="message" className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            Tu mensaje (opcional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <label className="flex items-start gap-2 text-xs text-ink-soft">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
          He leído y acepto la{" "}
          <Link href="/politica-de-privacidad" className="font-semibold text-accent">
            política de privacidad
          </Link>
        </label>
        <button
          type="submit"
          className="btn-blade w-full rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
        >
          Enviar mensaje
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
      />
    </div>
  );
}
