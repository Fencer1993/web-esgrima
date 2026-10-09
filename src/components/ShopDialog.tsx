"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal accesible: foco dentro (y devuelto al cerrar), Esc para
 * cerrar, Tab atrapado, scroll del fondo bloqueado. `variant="right"` es un
 * panel lateral; `"center"` es modal centrado en escritorio y hoja inferior
 * en móvil. Las animaciones solo se aplican sin prefers-reduced-motion.
 */
export function ShopDialog({
  labelledBy,
  onClose,
  variant,
  children,
}: {
  labelledBy: string;
  onClose: () => void;
  variant: "center" | "right";
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setEntered(true));
    const first = panel.current?.querySelector<HTMLElement>("[data-autofocus]");
    (first ?? panel.current)?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const a = items[0];
      const z = items[items.length - 1];
      const cur = document.activeElement;
      if (e.shiftKey && (cur === a || cur === panel.current)) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && cur === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, []);

  const place =
    variant === "right"
      ? `inset-y-0 right-0 w-full max-w-md ${entered ? "translate-x-0" : "translate-x-full"}`
      : `inset-x-0 bottom-0 max-h-[92dvh] rounded-t-lg sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90dvh] sm:w-[min(56rem,calc(100vw-3rem))] sm:-translate-x-1/2 sm:rounded-sm ${
          entered
            ? "translate-y-0 sm:-translate-y-1/2"
            : "translate-y-8 opacity-0 sm:-translate-y-[45%]"
        }`;

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden
        onClick={onClose}
        className={`absolute inset-0 bg-ink/55 motion-safe:transition-opacity motion-safe:duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`absolute flex flex-col overflow-hidden bg-paper shadow-2xl outline-none motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-out ${place}`}
      >
        {children}
      </div>
    </div>
  );
}
