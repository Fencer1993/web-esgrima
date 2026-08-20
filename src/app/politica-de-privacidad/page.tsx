import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos del Club de Esgrima Torremolinos.",
  alternates: { canonical: "/politica-de-privacidad" },
  robots: { index: false, follow: true },
};

export default function PoliticaDePrivacidad() {
  return (
    <>
      <PageHero title="Política de Privacidad" />
      <Section>
        <div className="max-w-2xl space-y-6 text-sm leading-relaxed text-ink-soft">
          {/* PENDIENTE: completar [Nombre/NIF] del responsable del tratamiento. */}
          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              Responsable del tratamiento
            </h2>
            <p className="mt-2">
              [Nombre completo o razón social del club], con domicilio en {site.address.line},{" "}
              {site.address.postalCode} {site.address.city}, es el responsable del tratamiento
              de los datos personales que nos facilites a través de este sitio web. Puedes
              contactar con nosotros en {site.contact.email}.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              Qué datos tratamos
            </h2>
            <p className="mt-2">
              Cuando completas el formulario de contacto tratamos los datos que nos facilitas
              voluntariamente: nombre, correo electrónico, teléfono (opcional), asunto y
              mensaje. No recopilamos datos a través de cookies de analítica o publicidad.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              Finalidad y base legal
            </h2>
            <p className="mt-2">
              Utilizamos tus datos exclusivamente para responder a tu consulta o solicitud de
              información sobre las actividades del club. La base legal es tu consentimiento,
              otorgado al enviar el formulario.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              Conservación
            </h2>
            <p className="mt-2">
              Conservamos tus datos únicamente durante el tiempo necesario para atender tu
              consulta, salvo que exista una obligación legal de conservación mayor (por
              ejemplo, si te inscribes como socio).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              Tus derechos
            </h2>
            <p className="mt-2">
              Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición,
              limitación y portabilidad escribiendo a {site.contact.email}, indicando el
              derecho que deseas ejercer y adjuntando copia de tu DNI o documento equivalente.
              También puedes presentar una reclamación ante la Agencia Española de Protección
              de Datos (aepd.es) si consideras que no hemos atendido correctamente tu
              solicitud.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              Terceros
            </h2>
            <p className="mt-2">
              No cedemos tus datos a terceros, salvo obligación legal. El formulario de
              contacto de este sitio se procesa mediante los proveedores de alojamiento y
              correo electrónico que utiliza el club para prestar el servicio.
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
