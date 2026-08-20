import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { FaqAccordion } from "@/components/FaqAccordion";
import { whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Esgrima en Silla de Ruedas",
  description:
    "El Club de Esgrima Torremolinos es la única sala de Andalucía con esgrima en silla de ruedas. Deporte adaptado e inclusivo, entrenado por un seleccionador nacional.",
  alternates: { canonical: "/esgrima-en-silla-de-ruedas" },
};

const wheelchairFaq = [
  {
    question: "¿Cómo funciona la esgrima en silla?",
    answer:
      "Las sillas están ancladas a unos aparatos de fijación, por lo que los deportistas están siempre a una distancia determinada sin caerse de la silla. La distancia se fija con el brazo estirado, tocando con la punta del arma el codo contrario. Los tocados se producen con rapidez, especialmente en sable, lo que obliga a entrenar los reflejos — resulta muy entretenido.",
  },
  {
    question: "¿Puedo entrenar si no tengo ninguna limitación física?",
    answer:
      "Por supuesto, puedes entrenar con el resto del grupo — siempre agradecemos que compañeros de esgrima a pie vengan a probar. Para competir de manera oficial en esta modalidad sí es requisito tener una lesión que justifique el uso de la silla.",
  },
  {
    question: "¿Hay modalidades dentro de la esgrima en silla?",
    answer:
      "Sí: categoría A (la afección física no imposibilita el movimiento del tren inferior), categoría B (imposibilita el tren inferior pero conserva el movimiento abdominal) y categoría C (personas que han perdido la fuerza abdominal, como en casos de tetraplejia).",
  },
  {
    question: "¿Debo comprar material?",
    answer:
      "El primer mes el uso del material del club es gratis. A partir del segundo mes puedes adquirir tu propio material o alquilar el material eléctrico (chaqueta eléctrica, careta y sable) a 5€ por pieza al mes.",
  },
  {
    question: "Los horarios son de mañana, ¿puedo venir por la tarde?",
    answer:
      "Si hay algún compañero que pueda entrenar por la tarde, se abre esa posibilidad de manera puntual y con previo aviso a los entrenadores disponibles.",
  },
  {
    question: "¿Existe esgrima ocio para silla de ruedas?",
    answer: "Sí, exactamente en las mismas condiciones que en el grupo de Adultos.",
  },
  {
    question: "¿Debo federarme?",
    answer:
      "Sí, el seguro médico deportivo es obligatorio. Lo gestiona la FEDDF (Federación Española de Deportistas con Discapacidad Física); nosotros tramitamos tu licencia.",
  },
];

export default function SillaDeRuedas() {
  return (
    <>
      <PageHero
        eyebrow="Esgrima adaptada"
        title="Esgrima en Silla de Ruedas"
        lede="La única sala de Andalucía con esgrima en silla de ruedas en sus entrenamientos habituales."
        path="/esgrima-en-silla-de-ruedas"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
            <p>
              Esta modalidad busca incluir a personas cuya movilidad ha quedado reducida por
              diversos motivos — paraplejia, tetraplejia u otras patologías que limiten o
              impidan el movimiento del tren inferior. Nuestro entrenador Carlos Soler es
              seleccionador nacional de Esgrima en Silla de Ruedas, así que tendrás al mejor
              entrenador dándote clases.
            </p>
            <p>
              Promovemos la esgrima inclusiva: el club acoge tanto a deportistas de esgrima
              convencional como a quienes tienen alguna discapacidad física, y realizamos
              competiciones amistosas en las que participan de manera igualitaria ambos
              perfiles. No solo apostamos por esta modalidad para el ocio, sino también para
              la competición — contamos con deportistas de amplio palmarés internacional, como
              el propio Carlos Soler, Antonio Garrido y Lorenzo Ribes.
            </p>
            <p>Podrás aprender las tres armas: espada, florete y sable.</p>
          </div>

          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                  Horario
                </dt>
                <dd className="mt-1 text-ink">Lunes, martes, miércoles y jueves, 10:00–12:30</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                  Mensualidad
                </dt>
                <dd className="mt-1 tabular text-ink">
                  30€/mes — incluye la oferta 2×1 y la prueba gratuita
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                  Seguro federativo (FEDDF)
                </dt>
                <dd className="mt-1 tabular text-ink">70€/año</dd>
              </div>
            </dl>
            <a
              href={whatsappLink("Hola, quiero información sobre esgrima en silla de ruedas")}
              className="mt-6 inline-flex w-full items-center justify-center rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
            >
              Contactar con Carlos Soler
            </a>
          </div>
        </div>
      </Section>

      <Section tone="raised" className="border-t border-line">
        <SectionHeading eyebrow="Dudas frecuentes" title="Esgrima Adaptada: Preguntas" />
        <FaqAccordion items={wheelchairFaq} />
      </Section>
    </>
  );
}
