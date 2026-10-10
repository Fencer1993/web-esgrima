import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FootworkTrainer } from "@/components/FootworkTrainer";
import { pageAlternates } from "@/content/i18n";

export const metadata: Metadata = {
  title: "Entrenador de pies por voz",
  description:
    "Entrena los desplazamientos de esgrima en casa: tu móvil canta avances, retrocesos y fondos al azar, con rondas, descansos y modo reacción por colores.",
  alternates: pageAlternates("/entrenador"),
};

export default function Entrenador() {
  return (
    <>
      <PageHero
        path="/entrenador"
        eyebrow="Entrena en casa"
        title="Entrenador de pies por voz"
        lede="Tu móvil canta las órdenes al azar («¡En guardia!… avance… retroceso… fondo!») y tú trabajas los pies. Sin registrarte y sin que se guarde nada."
      />
      <Section>
        <FootworkTrainer />
        <div className="mt-12 max-w-2xl text-sm leading-relaxed text-ink-soft">
          <h2 className="text-lg font-bold uppercase tracking-tight text-ink">Cómo funciona</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Elige el nivel, las rondas y el descanso, y pulsa «Empezar». Tras la cuenta atrás, la voz del móvil va diciendo las órdenes.</li>
            <li>La orden también sale en grande en la pantalla, para entrenar con el sonido apagado o si no oyes bien.</li>
            <li>Lleva la cuenta de los pasos que has dado y nunca te manda salirte de una pista de 6 pasos hacia cada lado: sirve un pasillo.</li>
            <li>Las órdenes pueden ser en español, en francés (el idioma de la esgrima) o en inglés.</li>
            <li>El modo reacción no usa voz: la pantalla cambia de color y cada color es una orden.</li>
            <li>Una vez cargada, la página funciona sin conexión. La pantalla se mantiene encendida mientras entrenas, si tu móvil lo permite.</li>
          </ul>
        </div>
      </Section>
    </>
  );
}
