import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { site, whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta con el Club de Esgrima Torremolinos. Ven a probar una clase gratis, escríbenos por WhatsApp o completa el formulario de contacto.",
  alternates: { canonical: "/contacto" },
};

export default function Contacto() {
  return (
    <>
      <PageHero
        eyebrow="Dónde estamos"
        title="Contacto"
        lede="Si quieres probar a hacer esgrima en nuestras instalaciones, solo tienes que venir con ropa deportiva, agua y toalla, 10 minutos antes para que podamos explicarte cómo funciona la clase."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-ink">
              Manda un WhatsApp
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              También puedes escribirnos un mensaje al WhatsApp, dejar tu correo, o escribir
              directamente a{" "}
              <a href={`mailto:${site.contact.email}`} className="font-semibold text-accent">
                {site.contact.email}
              </a>
              . ¡Te esperamos!
            </p>
            <a
              href={whatsappLink("Hola, quiero información sobre el club")}
              className="mt-6 inline-flex items-center rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
            >
              Escribir por WhatsApp
            </a>

            <dl className="mt-10 space-y-4 border-t border-line pt-6 text-sm">
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
              <div>
                <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                  Cómo llegar
                </dt>
                <dd className="mt-1">
                  <a
                    href={site.address.mapsUrl}
                    className="font-semibold text-accent underline underline-offset-4"
                  >
                    Ver en Google Maps →
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <ContactForm />
        </div>
      </Section>
    </>
  );
}

function ContactForm() {
  return (
    <form className="rounded-sm border border-line bg-paper-raised p-6">
      <h2 className="text-lg font-bold uppercase tracking-tight text-ink">
        Escríbenos para más información
      </h2>
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
            className="mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <label className="flex items-start gap-2 text-xs text-ink-soft">
          <input type="checkbox" required className="mt-0.5" />
          He leído y acepto la{" "}
          <a href="/politica-de-privacidad" className="font-semibold text-accent">
            política de privacidad
          </a>
        </label>
        <button
          type="submit"
          className="w-full rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
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
        className="mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </div>
  );
}
