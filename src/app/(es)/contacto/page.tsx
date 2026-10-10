import type { Metadata } from "next";
import { pageAlternates } from "@/content/i18n";
import { PageHero } from "@/components/PageHero";
import { pageText } from "@/content/texts";
import { Section } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { galleryPhoto } from "@/content/gallery";
import { site, whatsappLink } from "@/content/site";
import {
  ContactForm,
  IconMail,
  IconPhone,
  IconPin,
  IconWhatsapp,
  MethodCard,
} from "@/components/ContactParts";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta con el Club de Esgrima Torremolinos. Ven a probar una clase gratis, escríbenos por WhatsApp o rellena el formulario. Te respondemos encantados.",
  alternates: pageAlternates("/contacto"),
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
