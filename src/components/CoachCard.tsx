import { Photo } from "@/components/Photo";
import type { coaches } from "@/content/programs";

type Coach = (typeof coaches)[number];

export function CoachCard({ coach: c }: { coach: Coach }) {
  return (
    <div className="overflow-hidden rounded-sm border border-line bg-paper-raised transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg">
      <Photo
        src={c.photo.src}
        alt={c.photo.alt}
        width={c.photo.width}
        height={c.photo.height}
        className="aspect-[4/5] w-full object-cover object-top"
      />
      <div className="p-6">
        <h3 className="text-lg font-semibold uppercase tracking-tight text-ink">{c.name}</h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-accent">{c.role}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.bio}</p>
        <div className="mt-4 space-y-1 text-sm text-ink-soft">
          <p>
            <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:text-ink">
              {c.phone}
            </a>
          </p>
          {c.email && (
            <p>
              <a href={`mailto:${c.email}`} className="hover:text-ink">
                {c.email}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
