"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getInstallMode,
  getServerInstallMode,
  isStandalone,
  promptInstall,
  subscribeInstall,
} from "@/lib/pwaInstall";

const subscribeNone = () => () => {};

/**
 * Indicador "App" de la cabecera. Si el navegador permite instalar con un
 * toque (Chrome/Edge/Android), abre el diálogo nativo; si no, lleva a la
 * página con las instrucciones. Dentro de la app instalada no se muestra.
 */
export function AppInstallButton({ lang = "es" }: { lang?: "es" | "en" }) {
  const mode = useSyncExternalStore(subscribeInstall, getInstallMode, getServerInstallMode);
  const standalone = useSyncExternalStore(subscribeNone, isStandalone, () => false);
  if (standalone) return null;

  const en = lang === "en";
  const label = en ? "Install the club app" : "Instala la app del club";
  const cls =
    "relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line px-2.5 text-[13px] min-[400px]:px-3 font-medium text-ink transition-colors hover:border-accent hover:text-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const content = (
    <>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
        <path d="M12 7.5v6" />
        <path d="m9.5 11 2.5 2.5 2.5-2.5" />
        <path d="M10.5 18.5h3" />
      </svg>
      <span className="hidden min-[400px]:inline">App</span>
      {mode !== "none" && (
        <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
      )}
    </>
  );

  if (mode === "prompt") {
    return (
      <button type="button" onClick={() => promptInstall()} aria-label={label} title={label} className={cls}>
        {content}
      </button>
    );
  }
  return (
    <Link href={en ? "/en/app" : "/app"} hrefLang={en ? "en" : undefined} aria-label={label} title={label} className={cls}>
      {content}
    </Link>
  );
}
