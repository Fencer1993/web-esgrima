import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Política de cookies del sitio web del Club de Esgrima Torremolinos.",
  alternates: { canonical: "/politica-de-cookies-ue" },
  robots: { index: false, follow: true },
};

export default function PoliticaDeCookies() {
  return (
    <>
      <PageHero title="Política de Cookies" path="/politica-de-cookies-ue" />
      <Section>
        <div className="max-w-2xl space-y-6 text-sm leading-relaxed text-ink-soft">
          <p>
            Este sitio web utiliza únicamente cookies técnicas estrictamente necesarias para
            su funcionamiento (por ejemplo, para recordar tus preferencias de navegación).
            Actualmente no utilizamos cookies de analítica, personalización ni publicidad de
            terceros, por lo que no es necesario tu consentimiento para navegar por el sitio.
          </p>
          <p>
            Si en el futuro incorporamos herramientas de analítica (como Google Analytics) o
            de publicidad, actualizaremos esta política y te pediremos tu consentimiento
            mediante un aviso de cookies antes de activarlas.
          </p>
          <p>
            Puedes configurar tu navegador para bloquear o eliminar las cookies existentes en
            tu equipo en cualquier momento. Para más información sobre cómo hacerlo, consulta
            la ayuda de tu navegador.
          </p>
          <p>
            Si tienes cualquier duda sobre esta política, puedes escribirnos a{" "}
            {site.contact.email}.
          </p>
        </div>
      </Section>
    </>
  );
}
