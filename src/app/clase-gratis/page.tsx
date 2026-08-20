import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Prueba una Clase Gratis",
  description:
    "¡Ven al Club de Esgrima Torremolinos y prueba tu primera clase totalmente gratis! Sin compromiso, pero sabemos que te va a gustar la esgrima.",
  alternates: { canonical: "/clase-gratis" },
};

const steps = [
  {
    title: "Calentamiento",
    body: "Siempre realizamos un calentamiento general a base de juegos, y estiramos después de calentar.",
  },
  {
    title: "Desplazamientos básicos",
    body: "El entrenador te enseñará los tres movimientos básicos: marcha (hacia adelante), romper (hacia atrás) y fondo (movimiento de ataque). No necesitas saberlos de antemano.",
  },
  {
    title: "Trabajo técnico-táctico",
    body: "Ejercicios técnico-tácticos y, después, asaltos dirigidos o libres. Es probable que el entrenador se quede contigo para una clase particular de iniciación.",
  },
  {
    title: "Estiramientos finales",
    body: "Terminamos con estiramientos para prevenir agujetas y lesiones — son muy importantes.",
  },
];

export default function ClaseGratis() {
  return (
    <>
      <PageHero
        eyebrow="La palabra mágica: gratis"
        title="Primera Clase Gratis"
        lede="¿Quieres probar esgrima pero no te terminas de decidir? Ven el primer día gratis."
        path="/clase-gratis"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
            <p>
              Lo único que tendrás que traer es ropa y calzado deportivo, una botella de agua,
              una toalla y muchas ganas de aprender.
            </p>
            <p>
              A pesar de lo que se muestre en la tele, la esgrima es, ante todo, un deporte.
              Comprende una parte física que se entrena cada vez que pones en práctica los
              nuevos aprendizajes que irás obteniendo. Pero olvídate de gente rica, duques o de
              retar abofeteando con un guante.
            </p>
          </div>
          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <p className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              ¿No te he convencido aún?
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Echa un vistazo a la promo del 2x1. Vente con alguien más y si os apuntáis ambos,
              te sale gratis la mensualidad.
            </p>
            <a
              href={whatsappLink("Hola, quiero pedir una clase gratis")}
              className="mt-4 inline-flex items-center rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
            >
              Pedir una clase gratis
            </a>
          </div>
        </div>
      </Section>

      <Section tone="raised" className="border-t border-line">
        <SectionHeading eyebrow="Cómo funciona" title="¿Qué puedes esperar el primer día?" />
        <ol className="grid gap-6 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-sm border border-line bg-paper-raised p-6">
              <span className="font-mono text-xs text-accent">0{i + 1}</span>
              <h3 className="mt-1 font-display text-lg font-semibold uppercase tracking-tight text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm font-semibold text-ink">
          ¡Sí, podrás coger el sable y practicar el primer día!
        </p>
      </Section>
    </>
  );
}
