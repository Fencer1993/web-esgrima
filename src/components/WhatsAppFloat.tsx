"use client";

import { useSyncExternalStore } from "react";
import { whatsappLink } from "@/content/site";
import { ui, type Lang } from "@/content/i18n";

// Botón flotante de WhatsApp. Oculto en los primeros píxeles de scroll para no
// tapar el hero; aparece con fundido (y deslizamiento, salvo movimiento reducido).
const SHOW_AFTER = 300;

const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const isPastThreshold = () => window.scrollY > SHOW_AFTER;

export function WhatsAppFloat({ lang = "es" }: { lang?: Lang }) {
  const t = ui[lang];
  const visible = useSyncExternalStore(
    subscribeScroll,
    isPastThreshold,
    () => false,
  );

  return (
    <a
      href={whatsappLink(t.whatsappGeneral)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsappAria}
      tabIndex={visible ? undefined : -1}
      className={`fixed right-4 z-30 flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-[opacity,transform,background-color] duration-300 hover:bg-[#1ebe5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:right-6 lg:h-11 lg:w-auto lg:px-4 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none invisible opacity-0 translate-y-3 motion-reduce:translate-y-0"
      } motion-reduce:transition-opacity`}
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-7 w-7 fill-current lg:h-5 lg:w-5"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24ZM8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74 1.96.85 2.55.77 3.01.72.46-.05 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.16-.48-.29-.25-.12-1.47-.72-1.7-.8-.22-.09-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.35-.76-1.84-.2-.48-.4-.42-.55-.42h-.47Z" />
      </svg>
      <span className="hidden text-[13px] font-medium tracking-wide lg:inline">
        WhatsApp
      </span>
    </a>
  );
}
