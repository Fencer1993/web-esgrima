"use client";

import { useEffect, useRef } from "react";

// Cifras que "cuentan" al aparecer (patrón NumberTicker de Magic UI). El
// HTML ya trae el número final —buscadores y lectores sin JS lo ven—; la
// animación solo se aplica si el bloque entra en pantalla después.
const stats = [
  { value: 61, label: "socios", detail: "y la familia sigue creciendo" },
  { value: 5, label: "días a la semana", detail: "con la sala en marcha, de lunes a viernes" },
  { value: 6, label: "años", detail: "edad desde la que puedes ponerte la careta" },
  {
    value: 36,
    label: "pruebas internacionales",
    detail: "a las espaldas de nuestros técnicos y tiradores",
  },
];

export function StatsBand() {
  const ref = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    const nums = [...el.querySelectorAll<HTMLElement>("[data-value]")];
    nums.forEach((n) => (n.textContent = "0"));
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - start) / 1100);
        const ease = 1 - Math.pow(1 - k, 3);
        nums.forEach(
          (n) =>
            (n.textContent = String(
              Math.round(Number(n.dataset.value) * ease),
            )),
        );
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="border-b border-line bg-paper-raised">
      <dl
        ref={ref}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 py-10 lg:grid-cols-4"
      >
        {stats.map((s) => (
          <div key={s.label} className="border-l-2 border-accent pl-4">
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <span
                data-value={s.value}
                className="font-display text-5xl font-bold tabular text-ink"
              >
                {s.value}
              </span>
              <span className="ml-2 font-display text-lg font-semibold uppercase tracking-tight text-ink">
                {s.label}
              </span>
              <span className="mt-1 block text-xs text-ink-faint">
                {s.detail}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
