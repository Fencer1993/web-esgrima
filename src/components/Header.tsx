"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { whatsappLink } from "@/content/site";
import { equivalentPath, navFor, ui, type Lang } from "@/content/i18n";

// Cabecera de cristal que se compacta al hacer scroll. Menús agrupados con
// descripción (patrón de los NavigationMenu de shadcn/ui y Radix), sin
// dependencias: abre con clic, ratón o teclado; Esc y clic fuera lo cierran.
const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const isScrolled = () => window.scrollY > 8;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2 4.5 6 8.5l4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Selector de idioma ES | EN: enlaza a la página equivalente (mapa en content/i18n.ts)
// o, si esa página no tiene versión, a la portada del otro idioma.
function LanguageSwitcher({ lang, path }: { lang: Lang; path: string }) {
  const options: { code: Lang; label: string; name: string }[] = [
    { code: "es", label: "ES", name: "Español" },
    { code: "en", label: "EN", name: "English" },
  ];
  return (
    <div
      role="group"
      aria-label={ui[lang].langLabel}
      className="flex items-center gap-1 font-mono text-xs tracking-wide"
    >
      {options.map((o, i) => (
        <span key={o.code} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden className="text-ink-faint">
              |
            </span>
          )}
          {o.code === lang ? (
            <span
              lang={o.code}
              aria-current="true"
              title={o.name}
              className="rounded-sm bg-accent-soft px-1.5 py-1 font-semibold text-accent-dark"
            >
              {o.label}
            </span>
          ) : (
            <Link
              href={equivalentPath(path, o.code) ?? (o.code === "en" ? "/en/" : "/")}
              hrefLang={o.code}
              lang={o.code}
              aria-label={o.name}
              title={o.name}
              className="rounded-sm px-1.5 py-1 text-ink-soft transition-colors hover:text-ink"
            >
              {o.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}

export function Header({ lang = "es" }: { lang?: Lang }) {
  const t = ui[lang];
  const { menu: navMenu, links: navLinks } = navFor(lang);
  // Los enlaces a páginas que siguen en español, marcados en la versión inglesa.
  const hl = (href: string) => (lang === "en" && !href.startsWith("/en") ? "es" : undefined);
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    isScrolled,
    () => false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const close = () => {
    setMenu(null);
    setMobileOpen(false);
  };
  // Los enlaces con ancla (#...) apuntan a un tramo de otra página: no marcan activa la sección.
  const isActive = (href: string) =>
    !href.includes("#") && pathname === href.replace(/\/$/, "");

  useEffect(() => {
    if (menu === null) return;
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  const trigger =
    "relative inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] tracking-wide transition-colors";

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "border-line bg-paper/80 shadow-[0_1px_20px_-8px_rgba(23,35,43,0.25)]"
            : "border-transparent bg-paper/95"
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 transition-all duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link
            href={t.homeHref}
            className="group flex items-baseline gap-1.5"
            onClick={close}
          >
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Esgrima
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-accent">
              Torremolinos
            </span>
          </Link>

          <nav
            ref={navRef}
            aria-label={t.navMain}
            className="hidden items-center gap-1 lg:flex"
          >
            {navMenu.map((group) => {
              const open = menu === group.label;
              const active = group.items.some((i) => isActive(i.href));
              return (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => setMenu(group.label)}
                  onMouseLeave={() => setMenu(null)}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`menu-${group.label}`}
                    onClick={() => setMenu(open ? null : group.label)}
                    className={`${trigger} ${
                      open || active
                        ? "bg-accent-soft text-accent-dark"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {group.label}
                    <Chevron open={open} />
                  </button>
                  <div
                    id={`menu-${group.label}`}
                    className={`absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 transition-all duration-200 ${
                      open
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-1 opacity-0"
                    }`}
                  >
                    <ul className="rounded-md border border-line bg-paper p-1.5 shadow-xl">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            hrefLang={hl(item.href)}
                            onClick={close}
                            className={`block rounded-sm px-3 py-2.5 transition-colors hover:bg-paper-raised ${
                              isActive(item.href) ? "bg-paper-raised" : ""
                            }`}
                          >
                            <span className="block text-sm font-medium text-ink">
                              {item.label}
                            </span>
                            <span className="block text-xs text-ink-faint">
                              {item.description}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                            hrefLang={hl(item.href)}
                onClick={close}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`${trigger} ${
                  isActive(item.href)
                    ? "bg-accent-soft text-accent-dark"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
          <LanguageSwitcher lang={lang} path={pathname} />
          <a
            href={whatsappLink(t.whatsappTrial)}
            className="btn-blade hidden items-center rounded-full bg-accent px-4 py-1.5 text-[13px] font-medium tracking-wide text-white transition-colors hover:bg-accent-dark lg:inline-flex"
          >
            {t.freeClass}
          </a>

          <button
            type="button"
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="menu-movil"
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-full hover:bg-paper-raised lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span
              className={`h-px w-5 bg-ink transition-transform ${mobileOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-5 bg-ink transition-transform ${mobileOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
          </div>
        </div>
      </header>
      <div
        id="menu-movil"
        className={`fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-paper transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        } ${scrolled ? "top-14" : "top-16"}`}
      >
        <nav aria-label={t.navMobile} className="mx-auto max-w-6xl px-5 pb-10 pt-4">
          {navMenu.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                {group.label}
              </p>
              <ul className="mt-2">
                {group.items.map((item) => (
                  <li key={item.href} className="border-b border-line/70">
                    <Link
                      href={item.href}
                            hrefLang={hl(item.href)}
                      onClick={close}
                      className={`block py-3 ${isActive(item.href) ? "text-accent-dark" : "text-ink"}`}
                    >
                      <span className="block text-lg font-medium">
                        {item.label}
                      </span>
                      <span className="block text-xs text-ink-faint">
                        {item.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <ul className="mb-8">
            {navLinks.map((item) => (
              <li key={item.href} className="border-b border-line/70">
                <Link
                  href={item.href}
                            hrefLang={hl(item.href)}
                  onClick={close}
                  className={`block py-3 text-lg font-medium ${isActive(item.href) ? "text-accent-dark" : "text-ink"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={whatsappLink(t.whatsappTrial)}
            className="btn-blade flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white"
          >
            {t.freeClassMobile}
          </a>
        </nav>
      </div>
    </>
  );
}
