"use client";

import { useState, useSyncExternalStore } from "react";
import {
  getInstallMode,
  getServerInstallMode,
  promptInstall,
  subscribeInstall,
} from "@/lib/pwaInstall";

/**
 * Entrada permanente para instalar la app (pie de página). Solo aparece si el
 * navegador puede instalarla: Chrome/Edge/Android con el diálogo nativo, o
 * Safari de iOS con una indicación. Si ya está instalada, no se pinta.
 */
export function InstallAppLink({ lang = "es" }: { lang?: "es" | "en" }) {
  const en = lang === "en";
  const mode = useSyncExternalStore(subscribeInstall, getInstallMode, getServerInstallMode);
  const [hint, setHint] = useState(false);
  if (mode === "none") return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={mode === "ios" ? hint : undefined}
        onClick={() => (mode === "ios" ? setHint((h) => !h) : promptInstall())}
        className="group inline-flex items-center gap-3 rounded-sm border border-white/15 px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:border-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-5 w-5 text-accent"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 20h14" />
        </svg>
        {en ? "Install the club app" : "Instala la app del club"}
      </button>
      {mode === "ios" && hint && (
        <p role="status" className="mt-2 max-w-xs text-xs leading-relaxed text-paper/75">
          {en ? "Tap Share, then “Add to Home Screen”." : "Pulsa Compartir y después «Añadir a pantalla de inicio»."}
        </p>
      )}
    </div>
  );
}
