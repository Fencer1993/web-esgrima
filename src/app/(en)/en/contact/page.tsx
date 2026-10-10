import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Photo } from "@/components/Photo";
import {
  ContactForm,
  IconMail,
  IconPhone,
  IconPin,
  IconWhatsapp,
  MethodCard,
} from "@/components/ContactParts";
import { localizedGalleryPhoto } from "@/content/gallery";
import { site, whatsappLink } from "@/content/site";
import { pageAlternates } from "@/content/i18n";
import { enPageText } from "@/content/en";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Club de Esgrima Torremolinos. Come and try a free class, message us on WhatsApp or fill in the form. We will be delighted to hear from you.",
  alternates: pageAlternates("/en/contact"),
};

export default function ContactEn() {
  const hero = enPageText("/en/contact");
  const photo = localizedGalleryPhoto("clase-grupal-esgrima-sala-club-torremolinos", "en");
  const message = whatsappLink("Hello, I'd like some information about the club");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/en/contact"
        lang="en"
      />

      <section className="relative overflow-hidden bg-ink text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 -skew-x-12 bg-steel/25"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:py-12 md:flex-row md:items-center md:justify-between">
          <div className="reveal max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              The quickest way
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Send a WhatsApp
            </h2>
            <p className="mt-3 text-base text-paper/80">
              Tell us what you would like to know on WhatsApp, leave your details in the form or
              write straight to{" "}
              <a
                href={`mailto:${site.contact.email}`}
                className="link-touche font-semibold text-accent"
              >
                {site.contact.email}
              </a>
              . We will be delighted to help.
            </p>
          </div>
          <a
            href={message}
            className="btn-blade reveal inline-flex shrink-0 items-center justify-center gap-3 rounded-sm bg-accent px-7 py-4 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
          >
            <IconWhatsapp />
            Message us on WhatsApp
          </a>
        </div>
      </section>

      <Section>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MethodCard icon={<IconWhatsapp />} label="WhatsApp" value="Message us" href={message} />
          <MethodCard
            icon={<IconPhone />}
            label="Phone"
            value={site.contact.phone}
            href={`tel:${site.contact.phoneDial}`}
          />
          <MethodCard
            icon={<IconMail />}
            label="Email"
            value={site.contact.email}
            href={`mailto:${site.contact.email}`}
            breakAll
          />
          <MethodCard
            icon={<IconPin />}
            label="Address"
            value={`${site.address.line}, ${site.address.city}`}
            href={site.address.mapsUrl}
          />
        </ul>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="reveal">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Getting here
            </p>
            <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-ink">
              We are waiting for you at the Palacio de Deportes
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
                      Address
                    </dt>
                    <dd className="mt-1 text-ink">
                      {site.address.venue}
                      <br />
                      {site.address.line}, {site.address.postalCode} {site.address.city}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                      Phone
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
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>

          <div className="reveal">
            <ContactForm lang="en" />
          </div>
        </div>
      </Section>
    </>
  );
}
