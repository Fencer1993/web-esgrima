"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  getInstallMode,
  getServerInstallMode,
  promptInstall,
  readDismissed,
  subscribeInstall,
  writeDismissed,
} from "@/lib/pwaInstall";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
// Segundos hasta mostrar el aviso, para no tapar la primera impresión.
const BANNER_DELAY_MS = 8000;

function canRegister(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (!("serviceWorker" in navigator)) return false;
  const { protocol, hostname } = window.location;
  return protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1";
}

/**
 * Registra el service worker (public/sw.js) y muestra, como mucho una vez,
 * un aviso discreto para instalar la app. El botón permanente está en el
 * pie de página (InstallAppLink). Si el aviso estorba en una pantalla
 * (la tienda tiene el carrito abajo a la izquierda) se oculta.
 */
const T = {
  es: {
    label: "Instalar la app",
    title: "Instala la app del club",
    ios: "Pulsa Compartir y después «Añadir a pantalla de inicio».",
    text: "Horarios, precios y contacto a un toque, también sin conexión.",
    install: "Instalar",
    close: "Cerrar aviso de instalación",
  },
  en: {
    label: "Install the app",
    title: "Install the club app",
    ios: "Tap Share, then “Add to Home Screen”.",
    text: "Timetable, prices and contact in one tap, even offline.",
    install: "Install",
    close: "Close install notice",
  },
};

export function PwaRegister({ lang = "es" }: { lang?: "es" | "en" }) {
  const t = T[lang];
  const mode = useSyncExternalStore(subscribeInstall, getInstallMode, getServerInstallMode);
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!canRegister()) return;
    const register = () => {
      navigator.serviceWorker
        .register(`${basePath}/sw.js`, { scope: `${basePath}/` })
        .catch(() => undefined);
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  useEffect(() => {
    if (readDismissed()) return;
    const t = window.setTimeout(() => {
      setDismissed(false);
      setReady(true);
    }, BANNER_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const hideOnRoute = pathname.startsWith("/tienda") || pathname.startsWith("/en/shop") || pathname.startsWith("/offline");
  if (!ready || dismissed || mode === "none" || hideOnRoute) return null;

  const close = () => {
    writeDismissed();
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label={t.label}
      className="fixed left-4 right-[5.5rem] z-30 max-w-sm rounded-sm border border-white/15 bg-ink p-4 text-paper shadow-lg shadow-black/30 sm:right-auto lg:left-6"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <p className="pr-6 text-sm font-semibold">{t.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-paper/75">
        {mode === "ios"
          ? t.ios
          : t.text}
      </p>
      {mode === "prompt" && (
        <button
          type="button"
          onClick={async () => {
            await promptInstall();
            close();
          }}
          className="mt-3 inline-flex rounded-sm bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {t.install}
        </button>
      )}
      <button
        type="button"
        onClick={close}
        aria-label={t.close}
        className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center text-paper/70 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ×
        </span>
      </button>
    </div>
  );
}
