"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * Activa la animación de entrada .reveal de globals.css.
 *
 * El contenido es visible por defecto (sin JS o con movimiento reducido);
 * esto solo añade la clase que activa la transición y descubre cada
 * elemento al entrar en pantalla.
 *
 * Se vuelve a ejecutar en cada cambio de ruta (navegación con <Link>, que
 * no recarga la página) y vigila los nodos que se añaden después (filtros
 * de la galería, etc.). Sin esto, los bloques de la página nueva se
 * quedaban ocultos hasta recargar.
 */
export function RevealController() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    const scan = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)").forEach((el) => {
        // Lo que ya está en pantalla se marca visible en el mismo paso, para
        // que nunca se pinte un fotograma con ello oculto.
        if (el.getBoundingClientRect().top < vh * 0.95) el.classList.add("is-visible");
        else observer.observe(el);
      });
    };

    scan();
    document.documentElement.classList.add("js-reveal-ready");

    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
