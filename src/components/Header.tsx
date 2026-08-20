"use client";

import Link from "next/link";
import { useState } from "react";
import { navigation, whatsappLink } from "@/content/site";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            Esgrima
          </span>
          <span className="font-display text-xl font-bold uppercase tracking-tight text-accent">
            Torremolinos
          </span>
        </Link>

        <nav className="hidden lg:flex lg:items-center lg:gap-6">
          {navigation.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a
            href={whatsappLink("Hola, quiero probar una clase gratis")}
            className="inline-flex items-center rounded-sm bg-accent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
          >
            Clase gratis
          </a>
        </div>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`h-0.5 w-6 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-paper lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-2">
            {navigation.slice(1).map((item) => (
              <li key={item.href} className="border-b border-line last:border-none">
                <Link
                  href={item.href}
                  className="block py-3 text-sm font-medium text-ink-soft"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="py-3">
              <a
                href={whatsappLink("Hola, quiero probar una clase gratis")}
                className="inline-flex items-center rounded-sm bg-accent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
              >
                Clase gratis
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
