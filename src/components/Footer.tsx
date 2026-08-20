import Link from "next/link";
import { footerLinks, navigation, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold uppercase tracking-tight">
            {site.name}
          </p>
          <p className="mt-3 max-w-xs text-sm text-paper/70">{site.description}</p>
          <a
            href={site.social.instagram}
            className="mt-4 inline-block text-sm font-medium text-paper/80 underline underline-offset-4 hover:text-white"
          >
            Instagram
          </a>
        </div>

        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-paper/60">
            Club
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {navigation.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-paper/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-paper/60">
            Dónde estamos
          </p>
          <address className="mt-3 space-y-1 text-sm not-italic text-paper/80">
            <p>{site.address.venue}</p>
            <p>
              {site.address.line}, {site.address.postalCode} {site.address.city}
            </p>
            <p className="pt-2">
              <a href={`tel:${site.contact.phoneDial}`} className="hover:text-white">
                {site.contact.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${site.contact.email}`} className="hover:text-white">
                {site.contact.email}
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-paper/90">
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
