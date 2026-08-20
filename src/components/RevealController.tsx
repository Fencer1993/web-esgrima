"use client";

import { useLayoutEffect } from "react";

/**
 * Activates the .reveal scroll-in animation defined in globals.css.
 * Content is visible by default in plain CSS/HTML (no JS, no
 * prefers-reduced-motion) — this only adds the class that turns the
 * transition on, then reveals elements as they enter the viewport.
 *
 * Elements already within the viewport at mount are marked visible
 * synchronously, in the same pass that enables the animation class —
 * IntersectionObserver callbacks are asynchronous, so doing this
 * separately would let the browser paint a frame with that content
 * hidden before the observer catches up.
 */
export function RevealController() {
  useLayoutEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".reveal");
    if (targets.length === 0) return;

    const viewportHeight = window.innerHeight;
    const toObserve: HTMLElement[] = [];

    targets.forEach((el) => {
      if (el.getBoundingClientRect().top < viewportHeight * 0.95) {
        el.classList.add("is-visible");
      } else {
        toObserve.push(el);
      }
    });

    document.documentElement.classList.add("js-reveal-ready");

    if (toObserve.length === 0) return;

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

    toObserve.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
