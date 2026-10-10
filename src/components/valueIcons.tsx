import type { ReactNode } from "react";
import type { values } from "@/content/programs";

// Iconos de línea (viewBox 24x24) para la sección de valores.
export const valueIcons: Record<(typeof values)[number]["icon"], ReactNode> = {
  // Dos sables cruzados
  companerismo: (
    <>
      <path d="M4 4l11 11" />
      <path d="M20 4L9 15" />
      <path d="M13 17l2-2 2 2-2 2z" />
      <path d="M11 17l-2-2-2 2 2 2z" />
      <path d="M15 19l2 2" />
      <path d="M9 19l-2 2" />
    </>
  ),
  // Diana
  aprendizaje: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  // Personas juntas
  inclusion: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17 14a4 4 0 0 1 4 4v2" />
    </>
  ),
};
