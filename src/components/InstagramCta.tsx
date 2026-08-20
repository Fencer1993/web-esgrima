import { site } from "@/content/site";

export function InstagramCta() {
  const handle = site.social.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "");

  return (
    <div className="flex flex-col items-center gap-4 rounded-sm border border-line bg-paper-raised px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-steel-soft text-steel"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17.6" cy="6.4" r="1.15" fill="currentColor" />
          </svg>
        </span>
        <div>
          <p className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
            Síguenos en Instagram
          </p>
          <p className="text-sm text-ink-soft">
            Entrenamientos, competiciones y el día a día del club, en {handle}.
          </p>
        </div>
      </div>
      <a
        href={site.social.instagram}
        className="inline-flex shrink-0 items-center rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
      >
        Ver el perfil
      </a>
    </div>
  );
}
