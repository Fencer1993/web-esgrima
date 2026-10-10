"use client";

import { useSyncExternalStore } from "react";
import {
  getInstallMode,
  getServerInstallMode,
  isStandalone,
  promptInstall,
  subscribeInstall,
} from "@/lib/pwaInstall";

const subscribeNone = () => () => {};

const T = {
  es: {
    installed: "Ya tienes la app instalada en este dispositivo.",
    button: "Instalar la app ahora",
    ready: "Tu navegador permite instalarla con un toque:",
    iosNow: "Estás en un iPhone o iPad: sigue los pasos de «iPhone y iPad» de abajo.",
  },
  en: {
    installed: "The app is already installed on this device.",
    button: "Install the app now",
    ready: "Your browser can install it in one tap:",
    iosNow: "You are on an iPhone or iPad: follow the “iPhone and iPad” steps below.",
  },
};

/** Estado en vivo de la instalación en la página /app. */
export function AppInstallGuide({ lang = "es" }: { lang?: "es" | "en" }) {
  const t = T[lang];
  const mode = useSyncExternalStore(subscribeInstall, getInstallMode, getServerInstallMode);
  const standalone = useSyncExternalStore(subscribeNone, isStandalone, () => false);

  if (standalone) {
    return (
      <p role="status" className="rounded-sm border border-line bg-steel-soft px-5 py-4 font-semibold text-ink">
        ✓ {t.installed}
      </p>
    );
  }
  if (mode === "prompt") {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-sm border border-accent bg-accent-soft px-5 py-4">
        <p className="text-sm text-ink">{t.ready}</p>
        <button
          type="button"
          onClick={() => promptInstall()}
          className="btn-blade rounded-sm bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t.button}
        </button>
      </div>
    );
  }
  if (mode === "ios") {
    return (
      <p role="status" className="rounded-sm border border-accent bg-accent-soft px-5 py-4 text-sm text-ink">
        {t.iosNow}
      </p>
    );
  }
  return null;
}
