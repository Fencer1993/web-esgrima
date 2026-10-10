import { competitionGroups, physicalTraining, technificationNote } from "@/content/pricing";
import { whatsappLink } from "@/content/site";
import {
  enCompetitionGroups,
  enPhysicalTraining,
  enTechnificationNote,
} from "@/content/en";

const labels = {
  es: {
    eyebrow: "Tecnificación deportiva",
    title: "¿Quieres competir? Los lunes entrenamos para eso.",
    intro:
      "Dos grupos de esgrima de competición, uno para adolescentes y otro para mayores de 18 años, con una sesión específica cada lunes. Víctor Santiago, director técnico del club, te prepara para tus torneos.",
    cta: "Quiero información",
    message: "Hola, quiero información sobre la tecnificación y la competición",
  },
  en: {
    eyebrow: "Performance training",
    title: "Want to compete? Mondays are for that.",
    intro:
      "Two competition fencing groups, one for teenagers and one for over-18s, each with a dedicated session every Monday. Víctor Santiago, the club's technical director, prepares you for your tournaments.",
    cta: "I'd like more information",
    message: "Hello, I'd like some information about performance training and competing",
  },
};

// Bloque promocional de los grupos de tecnificación (lunes) y del
// entrenamiento físico gratuito. Los datos vienen de pricing.ts, así que
// el horario aquí nunca difiere del de la tabla.
export function CompetitionPromo({ lang = "es" }: { lang?: "es" | "en" }) {
  const t = labels[lang];
  const groups = lang === "en" ? enCompetitionGroups() : competitionGroups;
  const physical = lang === "en" ? enPhysicalTraining() : physicalTraining;
  const note = lang === "en" ? enTechnificationNote : technificationNote;
  return (
    <section
      id="tecnificacion"
      className="relative scroll-mt-16 overflow-hidden bg-ink text-paper"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 -skew-x-12 bg-steel/25"
      />
      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          {t.eyebrow}
        </p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-3 max-w-2xl text-base text-paper/80">
          {t.intro}
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <div
              key={g.name}
              className="reveal rounded-sm border border-paper/15 bg-paper/5 p-6 backdrop-blur-sm transition-colors hover:border-accent"
            >
              <p className="font-mono text-xs uppercase tracking-wide text-accent">
                {g.days}
              </p>
              <p className="mt-1 font-display text-4xl font-bold tabular">
                {g.hours}
              </p>
              <h3 className="mt-3 text-lg font-semibold uppercase tracking-tight">
                {g.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/75">
                {g.text}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-paper/60">* {note}</p>

        <div className="reveal mt-4 flex flex-col gap-4 rounded-sm border border-accent/50 bg-accent/10 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-accent">
              {physical.price} · {physical.days},{" "}
              {physical.hours}
            </p>
            <h3 className="mt-1 text-lg font-semibold uppercase tracking-tight">
              {physical.name}
            </h3>
            <p className="mt-1 max-w-xl text-sm text-paper/75">
              {physical.text}
            </p>
          </div>
          <a
            href={whatsappLink(t.message)}
            className="btn-blade inline-flex shrink-0 items-center justify-center rounded-sm bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white"
          >
            {t.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
