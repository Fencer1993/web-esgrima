import type { Metadata } from "next";
import { AppPage } from "@/components/AppPage";
import { pageAlternates } from "@/content/i18n";

export const metadata: Metadata = {
  title: "La app del club",
  description:
    "Instala la web del Club de Esgrima Torremolinos en tu móvil como una app: horarios, calendario, avisos y tienda a un toque, también sin conexión.",
  alternates: pageAlternates("/app"),
};

export default function App() {
  return <AppPage lang="es" />;
}
