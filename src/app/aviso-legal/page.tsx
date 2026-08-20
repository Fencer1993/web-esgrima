import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Aviso Legal",
  description: "Información legal del Club de Esgrima Torremolinos.",
  alternates: { canonical: "/aviso-legal" },
  robots: { index: false, follow: true },
};

export default function AvisoLegal() {
  return (
    <>
      <PageHero title="Aviso Legal" />
      <Section>
        <div className="prose-legal max-w-2xl space-y-6 text-sm leading-relaxed text-ink-soft">
          {/*
            PENDIENTE: sustituir los datos entre [corchetes] por la identidad
            legal real del club (titular, NIF/CIF, forma jurídica, registro
            si aplica) antes de publicar.
          */}
          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              1. Titular del sitio web
            </h2>
            <p className="mt-2">
              En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información
              y de Comercio Electrónico (LSSI-CE), se informa que este sitio web,{" "}
              {site.domain}, es titularidad de:
            </p>
            <ul className="mt-2 list-disc pl-5">
              <li>Titular: [Nombre completo o razón social del club]</li>
              <li>NIF/CIF: [Pendiente de completar]</li>
              <li>
                Domicilio: {site.address.line}, {site.address.postalCode} {site.address.city},{" "}
                {site.address.region}
              </li>
              <li>Correo electrónico: {site.contact.email}</li>
              <li>Teléfono: {site.contact.phone}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              2. Objeto
            </h2>
            <p className="mt-2">
              Este sitio web tiene por objeto informar sobre las actividades, horarios, precios
              e instalaciones del Club de Esgrima Torremolinos, así como facilitar el contacto
              con personas interesadas en practicar esgrima.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              3. Propiedad intelectual
            </h2>
            <p className="mt-2">
              Los contenidos de este sitio web (textos, imágenes, diseño y código) son
              propiedad del Club de Esgrima Torremolinos o de terceros que han autorizado su
              uso, y están protegidos por la normativa de propiedad intelectual. Queda
              prohibida su reproducción total o parcial sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              4. Responsabilidad
            </h2>
            <p className="mt-2">
              El club no se hace responsable de los daños derivados de un uso inadecuado de
              este sitio web, ni de la información contenida en sitios web de terceros
              enlazados desde aquí.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              5. Legislación aplicable
            </h2>
            <p className="mt-2">
              Las presentes condiciones se rigen por la legislación española. Para cualquier
              controversia serán competentes los juzgados y tribunales del domicilio del club,
              salvo que la ley aplicable disponga otra cosa.
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
