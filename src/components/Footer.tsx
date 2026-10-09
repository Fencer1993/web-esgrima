import Link from "next/link";
import { footerLinks, navigation, site, whatsappLink } from "@/content/site";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

const headingClass =
  "font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink text-paper">
      {/* Decoración: hoja diagonal y texto de contorno (no indexable) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-10 h-[140%] w-px origin-top rotate-[28deg] bg-gradient-to-b from-transparent via-white/25 to-transparent" />
        <div className="absolute -right-10 -top-10 h-[140%] w-px origin-top rotate-[28deg] bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
        <span
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[26vw] font-bold uppercase leading-none tracking-tight text-transparent sm:text-[16rem]"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.07)" }}
        >
          En garde
        </span>
      </div>

      {/* Banda de cierre con CTA */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className={headingClass}>Primera clase gratis</p>
            <h2 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl">
              ¿Te atreves
              <br />
              con el <span className="text-accent">sable</span>?
            </h2>
            <p className="mt-5 max-w-md text-base text-paper/75">
              Ven a probar sin compromiso. Te prestamos el material y te
              explicamos todo en tu primera clase.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href={whatsappLink("Hola, quiero probar una clase gratis")}
              className="btn-blade inline-flex items-center justify-center rounded-sm bg-accent px-7 py-4 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Reservar por WhatsApp
            </a>
            <Link
              href="/clase-gratis"
              className="link-touche inline-flex items-center gap-2 self-start py-2 text-sm font-semibold uppercase tracking-wide text-paper sm:self-auto"
            >
              Cómo funciona la clase gratis
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Columnas */}
      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <p className="font-display text-2xl font-bold uppercase leading-tight tracking-tight">
            {site.name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/70">
            {site.description}
          </p>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 inline-flex items-center gap-3 rounded-sm border border-white/15 px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:border-accent hover:text-white"
          >
            <InstagramIcon className="h-5 w-5 text-accent transition-transform group-hover:-rotate-6 group-hover:scale-110" />
            Síguenos en Instagram
          </a>
        </div>

        <div>
          <p className={headingClass}>Club</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {navigation.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="link-touche text-paper/80 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <p className={headingClass}>Dónde estamos</p>
          <address className="mt-4 space-y-1 text-sm not-italic text-paper/80">
            <p className="font-medium text-paper">{site.address.venue}</p>
            <p>
              {site.address.line}, {site.address.postalCode}{" "}
              {site.address.city}
            </p>
            <p>{site.address.region}</p>
            <p className="pt-3">
              <a
                href={`tel:${site.contact.phoneDial}`}
                className="link-touche transition-colors hover:text-white"
              >
                {site.contact.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${site.contact.email}`}
                className="link-touche break-all transition-colors hover:text-white"
              >
                {site.contact.email}
              </a>
            </p>
          </address>
          <a
            href={site.address.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-touche mt-4 inline-flex items-center gap-2 text-sm font-semibold text-paper transition-colors hover:text-white"
          >
            <PinIcon className="h-4 w-4 text-accent" />
            Ver en Google Maps
          </a>
        </div>
      </div>

      {/* Barra legal */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 pb-24 pt-5 text-xs lg:pb-5 lg:pr-40 text-paper/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="link-touche transition-colors hover:text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
