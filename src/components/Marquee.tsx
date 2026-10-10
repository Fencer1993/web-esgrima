import Link from "next/link";
import { Photo } from "@/components/Photo";
import { localizedGalleryItems } from "@/content/gallery";
import type { Lang } from "@/content/i18n";

const labels = {
  es: {
    aria: "El club en imágenes",
    eyebrow: "En la pista",
    title: "El Club en Imágenes",
    text: "Así se vive el club: entrenamientos, torneos y podios de nuestros esgrimistas en Andalucía y en el circuito nacional.",
    link: "Ver toda la galería →",
  },
  en: {
    aria: "The club in pictures",
    eyebrow: "On the piste",
    title: "The Club in Pictures",
    text: "This is what the club is like: training, tournaments and podiums for our fencers in Andalusia and on the national circuit.",
    link: "See the whole gallery (in Spanish) →",
  },
};

// Cinta infinita de fotos (patrón "Marquee" de Magic UI), solo CSS: se
// detiene al pasar el ratón y, con movimiento reducido, pasa a ser una
// fila con scroll horizontal. La segunda copia es decorativa (aria-hidden).
export function Marquee({ count = 12, lang = "es" }: { count?: number; lang?: Lang }) {
  const t = labels[lang];
  const items = localizedGalleryItems(lang).slice(0, count);
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 gap-4 pr-4">
      {items.map((g) => (
        <li key={g.src} className="shrink-0">
          <Photo
            src={g.src}
            alt={hidden ? "" : g.alt}
            width={g.width}
            height={g.height}
            className="h-56 w-auto rounded-sm object-cover sm:h-64"
          />
        </li>
      ))}
    </ul>
  );
  return (
    <section
      aria-label={t.aria}
      className="overflow-hidden bg-paper py-14 sm:py-20"
    >
      <div className="mx-auto mb-8 max-w-6xl px-5">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          {t.eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-3 max-w-2xl text-base text-ink-soft">
          {t.text}
        </p>
      </div>
      <div className="marquee-mask">
        <div className="marquee-track flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-5 text-sm">
        <Link
          href="/instalaciones"
          className="link-touche font-semibold text-accent-dark"
        >
          {t.link}
        </Link>
      </p>
    </section>
  );
}
