"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import type { GalleryItem } from "@/content/gallery";

const ALL = "Todo";

// Animación de entrada al cambiar de filtro (solo si no hay reduced-motion).
const css = `
@media (prefers-reduced-motion: no-preference) {
  .gallery-item { animation: gallery-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .gallery-dialog[open] { animation: gallery-fade 0.2s ease-out both; }
  .gallery-dialog[open]::backdrop { animation: gallery-fade 0.2s ease-out both; }
}
@keyframes gallery-in { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
@keyframes gallery-fade { from { opacity: 0; } to { opacity: 1; } }
`;

export function Gallery({ items: galleryItems }: { items: GalleryItem[] }) {
  // Categorías derivadas de los datos, por orden de primera aparición.
  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(galleryItems.map((i) => String(i.category))))],
    [galleryItems],
  );
  const [filterState, setFilter] = useState<string>(ALL);
  const filter = categories.includes(filterState) ? filterState : ALL;

  const items = useMemo(
    () =>
      filter === ALL
        ? galleryItems
        : galleryItems.filter((i) => String(i.category) === filter),
    [filter, galleryItems],
  );

  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbs = useRef(new Map<string, HTMLButtonElement>());
  const current = active !== null ? items[active] : undefined;
  const isOpen = current !== undefined;

  // Abre/cierra el <dialog> nativo según el estado.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Bloquea el scroll del fondo mientras el visor está abierto.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const total = items.length;
  const go = (delta: number) =>
    setActive((a) => (a === null || total === 0 ? a : (a + delta + total) % total));

  // Se dispara con Esc, con el botón de cerrar y con el clic en el fondo.
  const handleClose = () => {
    const src = current?.src;
    setActive(null);
    if (src) {
      requestAnimationFrame(() => thumbs.current.get(src)?.focus());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const navBtn =
    "flex h-11 w-11 items-center justify-center rounded-full bg-paper/10 text-paper transition-colors hover:bg-paper/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper";

  return (
    <div>
      <style>{css}</style>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar fotos por categoría">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
            className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              filter === c
                ? "bg-ink text-paper"
                : "border border-line text-ink-soft hover:border-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div key={filter} className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, i) => (
          <figure
            key={item.src}
            className="gallery-item mb-4 break-inside-avoid overflow-hidden rounded-sm border border-line bg-paper-raised"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <button
              type="button"
              ref={(el) => {
                if (el) thumbs.current.set(item.src, el);
                else thumbs.current.delete(item.src);
              }}
              onClick={() => setActive(i)}
              aria-haspopup="dialog"
              aria-label={`Ampliar foto: ${item.alt}`}
              className="group relative block w-full cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
              <Photo
                src={item.src}
                alt=""
                width={item.width}
                height={item.height}
                className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100"
              />
              {/* Pie superpuesto solo en pantallas grandes con puntero */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full bg-gradient-to-t from-ink/90 via-ink/70 to-transparent p-4 pt-10 text-left transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none lg:block"
              >
                <span className="block font-mono text-[10px] uppercase tracking-wide text-paper/80">
                  {item.category}
                </span>
                <span className="mt-1 block text-sm leading-snug text-paper">
                  {item.caption}
                </span>
              </span>
            </button>
            {/* Pie siempre visible en móvil/táctil y tablet */}
            <figcaption className="p-4 lg:sr-only">
              <span className="font-mono text-[10px] uppercase tracking-wide text-steel">
                {item.category}
              </span>
              <p className="mt-1 text-sm leading-snug text-ink-soft">{item.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Visor de fotos"
        onClose={handleClose}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="gallery-dialog fixed inset-0 m-0 h-full max-h-none w-full max-w-none flex-col items-center justify-center bg-transparent p-0 text-paper backdrop:bg-ink/95 open:flex"
      >
        {current && (
          <>
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
              <span className="font-mono text-xs tracking-wide text-paper/80" aria-live="polite">
                {(active ?? 0) + 1} / {total}
              </span>
              <button
                type="button"
                autoFocus
                onClick={() => dialogRef.current?.close()}
                aria-label="Cerrar visor"
                className={navBtn}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <figure className="flex max-h-full w-full max-w-5xl flex-col items-center px-4 pb-4 pt-16 sm:px-20">
              <Photo
                key={current.src}
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                className="h-auto max-h-[70vh] w-auto max-w-full rounded-sm object-contain"
              />
              <figcaption className="mt-4 max-w-2xl text-center" aria-live="polite">
                <span className="block font-mono text-[10px] uppercase tracking-wide text-paper/70">
                  {current.category}
                </span>
                <span className="mt-1 block text-sm leading-snug sm:text-base">
                  {current.caption}
                </span>
              </figcaption>
            </figure>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Foto anterior"
                  className={`${navBtn} absolute left-2 top-1/2 -translate-y-1/2 sm:left-4`}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Foto siguiente"
                  className={`${navBtn} absolute right-2 top-1/2 -translate-y-1/2 sm:right-4`}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </>
        )}
      </dialog>
    </div>
  );
}
