"use client";

import { useEffect } from "react";

/**
 * Activates the .reveal scroll-in animation defined in globals.css.
 * Content is visible by default in plain CSS/HTML (no JS, no
 * prefers-reduced-motion) — this only adds the class that turns the
 * transition on, then reveals elements as they enter the viewport.
 */
export function RevealController() {
  useEffect(() => {
    document.documentElement.classList.add("js-reveal-ready");

    const targets = document.querySelectorAll(".reveal");
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
