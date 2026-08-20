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
          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              1. Titular del sitio web
            </h2>
            <p className="mt-2">
              En cumplimiento del deber de información del artículo 10 de la Ley 34/2002, de
              Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE),
              se informa que este sitio web, {site.domain}, es titularidad de:
            </p>
            <ul className="mt-2 list-disc pl-5">
              <li>Denominación: {site.legal.entityName}</li>
              <li>CIF: {site.legal.cif}</li>
              <li>
                Naturaleza jurídica: {site.legal.legalForm}, inscrito como entidad deportiva
                al amparo de la Ley 5/2016, de 19 de julio, del Deporte de Andalucía, y
                afiliado a la Federación Andaluza de Esgrima
              </li>
              <li>
                Representante legal: {site.legal.representative} ({site.legal.representativeRole}
                ), DNI {site.legal.representativeDni}
              </li>
              <li>
                Domicilio social: {site.address.line}, {site.address.postalCode}{" "}
                {site.address.city}, {site.address.region}
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
              con personas interesadas en practicar esgrima. El acceso a este sitio web es
              gratuito y no requiere registro previo, salvo para el envío del formulario de
              contacto.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              3. Propiedad intelectual e industrial
            </h2>
            <p className="mt-2">
              Los contenidos de este sitio web (textos, imágenes, diseño gráfico y código
              fuente) son propiedad de {site.legal.entityName} o de terceros que han
              autorizado su uso, y están protegidos por la normativa española y comunitaria de
              propiedad intelectual e industrial. Queda prohibida su reproducción,
              distribución o transformación total o parcial sin autorización expresa del
              club, salvo en los casos permitidos por la ley.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              4. Responsabilidad
            </h2>
            <p className="mt-2">
              El club realiza sus mejores esfuerzos para que la información publicada sea
              exacta y esté actualizada, pero no garantiza la ausencia de errores ni la
              disponibilidad continua del sitio web. El club no se hace responsable de los
              daños derivados de un uso inadecuado de este sitio web, ni de la información
              contenida en sitios web de terceros enlazados desde aquí (Google Maps,
              WhatsApp, Instagram, YouTube, Federación Andaluza de Esgrima), sobre los que no
              ejerce ningún tipo de control.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              5. Protección de datos
            </h2>
            <p className="mt-2">
              El tratamiento de los datos personales facilitados a través de este sitio web se
              rige por nuestra{" "}
              <a href="/politica-de-privacidad" className="font-semibold text-accent">
                Política de Privacidad
              </a>
              , conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018, de
              Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              6. Legislación aplicable y jurisdicción
            </h2>
            <p className="mt-2">
              Las presentes condiciones se rigen por la legislación española. Para la
              resolución de cualquier controversia derivada del uso de este sitio web serán
              competentes los juzgados y tribunales del domicilio del club en Torremolinos
              (Málaga), salvo que la normativa de protección de consumidores y usuarios
              disponga un fuero distinto.
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
