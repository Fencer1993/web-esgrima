import type { Metadata } from "next";
import { AppPage } from "@/components/AppPage";
import { pageAlternates } from "@/content/i18n";

export const metadata: Metadata = {
  title: "The club app",
  description:
    "Install the Club de Esgrima Torremolinos website on your phone as an app: timetable, calendar, notifications and shop in one tap, even offline.",
  alternates: pageAlternates("/en/app"),
};

export default function App() {
  return <AppPage lang="en" />;
}
