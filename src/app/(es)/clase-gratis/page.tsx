import type { Metadata } from "next";
import { pageAlternates } from "@/content/i18n";
import { PageHero } from "@/components/PageHero";
import { pageText } from "@/content/texts";
import { Photo } from "@/components/Photo";
import { Section, SectionHeading } from "@/components/Section";
import { galleryPhoto } from "@/content/gallery";
import { whatsappLink } from "@/content/site";
import claseGratis from "@/content/data/clase-gratis.json";

export const metadata: Metadata = {
  title: "Prueba una Clase Gratis",
  description:
    "Prueba tu primera clase de esgrima gratis en el Club de Esgrima Torremolinos. Sin compromiso, y con un sable en la mano desde el primer día.",
  alternates: pageAlternates("/clase-gratis"),
};

const steps = claseGratis.steps.map((s) => ({
  title: s.title,
  body: s.text,
  photo: galleryPhoto(s.photo),
}));

export default function ClaseGratis() {
  const hero = pageText("/clase-gratis");
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        path="/clase-gratis"
      />

      <Section>
        <Photo
          src="/images/galeria/equipo-esgrimistas-club-torremolinos-competicion.webp"
          alt="Esgrimistas del club sonriendo juntos antes de una competición"
          width={1200}
          height={900}
          className="mb-10 aspect-[16/9] w-full rounded-sm border border-line object-cover object-[center_40%]"
        />
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
            <p>
              Solo tienes que traer ropa y calzado deportivo, una botella de agua, una toalla
              y muchas ganas de aprender. Del resto nos encargamos nosotros.
            </p>
            <p>
              Aunque en la tele se vea otra cosa, la esgrima es, ante todo, un deporte. Se
              suda, se corre y se piensa rápido, y cada cosa nueva que aprendes la entrenas
              con el cuerpo. Olvídate de duques, de gente rica y de retar a nadie abofeteándolo
              con un guante.
            </p>
          </div>
          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <p className="font-display text-lg font-bold uppercase tracking-tight text-ink">
              ¿Todavía dudas?
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Mira la promo del 2x1. Vente con alguien más y, si os apuntáis los dos, te sale
              gratis la mensualidad.
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
        <SectionHeading eyebrow="Cómo funciona" title="Tu primera clase, paso a paso" />
        <ol className="relative mx-auto max-w-3xl">
          <span
            aria-hidden="true"
            className="absolute bottom-4 left-5 top-4 w-px -translate-x-1/2 bg-gradient-to-b from-accent via-steel to-line"
          />
          {steps.map((s, i) => (
            <li key={s.title} className="reveal relative pb-8 pl-14 last:pb-0 md:pl-16">
              <span className="absolute left-5 top-5 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-accent bg-paper-raised font-mono text-sm font-bold text-accent">
                {i + 1}
              </span>
              <div className="overflow-hidden rounded-sm border border-line bg-paper">
                <div className="p-5 md:p-6">
                  <p className="font-mono text-xs uppercase tracking-widest text-steel">
                    Paso {i + 1} de {steps.length}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold uppercase tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                </div>
                <Photo
                  src={s.photo.src}
                  alt={s.photo.alt}
                  width={s.photo.width}
                  height={s.photo.height}
                  className="aspect-[16/9] w-full border-t border-line object-cover object-[center_30%] md:aspect-[2/1]"
                />
              </div>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-8 max-w-3xl pl-14 text-sm font-semibold text-ink md:pl-16">
          Y sí: el primer día ya coges el sable y practicas.
        </p>
      </Section>
    </>
  );
}
