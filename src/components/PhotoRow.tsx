import { Photo } from "@/components/Photo";
import { localizedGalleryPhoto } from "@/content/gallery";
import type { Lang } from "@/content/i18n";

// Fila de fotos de la galería con su pie. Con `feature`, la primera ocupa
// todo el ancho (útil para enseñar volumen de grupo).
export function PhotoRow({
  names,
  feature = false,
  lang = "es",
}: {
  names: string[];
  feature?: boolean;
  lang?: Lang;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {names.map((n, i) => {
        const g = localizedGalleryPhoto(n, lang);
        const big = feature && i === 0;
        return (
          <figure
            key={g.src}
            className={`reveal group overflow-hidden rounded-sm border border-line bg-paper-raised ${big ? "sm:col-span-2" : ""}`}
          >
            <div className="overflow-hidden">
              <Photo
                src={g.src}
                alt={g.alt}
                width={g.width}
                height={g.height}
                priority={i === 0}
                className={`w-full object-cover object-[center_35%] transition-transform duration-700 group-hover:scale-[1.03] ${big ? "aspect-[16/9]" : "aspect-[4/3]"}`}
              />
            </div>
            <figcaption className="px-4 py-3 text-xs leading-snug text-ink-soft">
              {g.caption}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
