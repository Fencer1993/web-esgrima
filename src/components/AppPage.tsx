import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { AppInstallGuide } from "@/components/AppInstallGuide";
import { AvisosToggle } from "@/components/AvisosToggle";

const C = {
  es: {
    eyebrow: "En tu móvil",
    title: "La app del club",
    lede: "Instala la web del club en tu móvil como una app: un icono en la pantalla de inicio, a pantalla completa y sin descargas de ninguna tienda.",
    whatTitle: "Qué tienes con la app",
    what: [
      ["Un toque", "Horarios, precios, calendario, noticias y tienda desde el icono del club, sin buscar la web."],
      ["Sin conexión", "Las páginas que ya has visitado se abren aunque no tengas cobertura en el polideportivo."],
      ["Avisos del club", "Convocatorias, cambios de horario y noticias importantes en tu móvil, si los activas."],
      ["Ligera y sin tiendas", "No ocupa casi espacio, no pide datos y se actualiza sola. Se quita como cualquier app."],
    ],
    trainerTitle: "Entrenador de pies por voz",
    trainerText: "Entrena los desplazamientos en casa: el móvil canta avances, retrocesos y fondos al azar. Funciona sin conexión.",
    trainerLink: "Abrir el entrenador →",
    trainerHref: "/entrenador",
    howTitle: "Cómo instalarla",
    android: "Android (Chrome)",
    androidSteps: [
      "Abre esta web en Chrome.",
      "Pulsa el botón «App» de arriba o el menú ⋮ y elige «Instalar aplicación» (o «Añadir a pantalla de inicio»).",
      "Confirma con «Instalar». El icono del club aparecerá con tus apps.",
    ],
    ios: "iPhone y iPad (Safari)",
    iosSteps: [
      "Abre esta web en Safari (en otros navegadores de iPhone no se puede).",
      "Pulsa el botón Compartir (el cuadrado con la flecha hacia arriba).",
      "Elige «Añadir a pantalla de inicio» y después «Añadir».",
    ],
    desktop: "Ordenador (Chrome o Edge)",
    desktopSteps: [
      "Pulsa el icono de instalar que aparece a la derecha de la barra de direcciones.",
      "O usa el botón «App» de arriba y confirma con «Instalar».",
    ],
    avisosTitle: "Avisos en el móvil",
    avisosText: "Una vez instalada, activa los avisos para enterarte de convocatorias y cambios. En iPhone necesitas iOS 16.4 o posterior y tener la app instalada.",
    privacy: "La app es la misma web del club: no recoge datos personales ni necesita registrarte.",
  },
  en: {
    eyebrow: "On your phone",
    title: "The club app",
    lede: "Install the club website on your phone as an app: an icon on your home screen, full screen, with no app store download.",
    whatTitle: "What you get",
    what: [
      ["One tap", "Timetable, prices, calendar, news and shop from the club icon, without searching for the website."],
      ["Works offline", "Pages you have already visited open even without signal at the sports centre."],
      ["Club notifications", "Call-ups, timetable changes and important news on your phone, if you turn them on."],
      ["Light, no app store", "Takes almost no space, asks for no personal data and updates itself. Remove it like any app."],
    ],
    trainerTitle: "Voice footwork trainer",
    trainerText: "Train your footwork at home: your phone calls out advances, retreats and lunges at random. Works offline.",
    trainerLink: "Open the trainer →",
    trainerHref: "/en/footwork-trainer",
    howTitle: "How to install it",
    android: "Android (Chrome)",
    androidSteps: [
      "Open this website in Chrome.",
      "Tap the “App” button at the top, or the ⋮ menu and choose “Install app” (or “Add to Home screen”).",
      "Confirm with “Install”. The club icon will appear with your apps.",
    ],
    ios: "iPhone and iPad (Safari)",
    iosSteps: [
      "Open this website in Safari (other iPhone browsers can't do it).",
      "Tap the Share button (the square with the arrow pointing up).",
      "Choose “Add to Home Screen”, then “Add”.",
    ],
    desktop: "Computer (Chrome or Edge)",
    desktopSteps: [
      "Click the install icon on the right of the address bar.",
      "Or use the “App” button at the top and confirm with “Install”.",
    ],
    avisosTitle: "Notifications",
    avisosText: "Once installed, turn on notifications to hear about call-ups and changes. On iPhone you need iOS 16.4 or later and the app installed.",
    privacy: "The app is the club website itself: it collects no personal data and needs no sign-up.",
  },
};

export function AppPage({ lang = "es" }: { lang?: "es" | "en" }) {
  const t = C[lang];
  const blocks: [string, string[]][] = [
    [t.android, t.androidSteps],
    [t.ios, t.iosSteps],
    [t.desktop, t.desktopSteps],
  ];
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lede={t.lede} path={lang === "en" ? "/en/app" : "/app"} lang={lang} />
      <Section>
        <div className="max-w-3xl">
          <AppInstallGuide lang={lang} />
        </div>

        <h2 className="mt-10 text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">{t.whatTitle}</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {t.what.map(([h, p]) => (
            <li key={h} className="rounded-sm border border-line bg-paper-raised p-5">
              <h3 className="font-display text-lg font-semibold uppercase tracking-tight text-ink">{h}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{p}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 max-w-3xl rounded-sm border border-line p-5">
          <h3 className="font-display text-lg font-semibold uppercase tracking-tight text-ink">{t.trainerTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t.trainerText}</p>
          <Link href={t.trainerHref} className="link-touche mt-3 inline-block text-sm font-semibold text-accent-dark">
            {t.trainerLink}
          </Link>
        </div>

        <h2 className="mt-12 text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">{t.howTitle}</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {blocks.map(([h, steps]) => (
            <section key={h} className="rounded-sm border border-line p-5">
              <h3 className="font-display text-lg font-semibold uppercase tracking-tight text-ink">{h}</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
                {steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <div className="mt-12 max-w-3xl rounded-sm border border-line bg-paper-raised p-6">
          <h2 className="font-display text-xl font-semibold uppercase tracking-tight text-ink">{t.avisosTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.avisosText}</p>
          <div className="mt-4">
            <AvisosToggle lang={lang} variant="light" />
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-sm text-ink-faint">{t.privacy}</p>
      </Section>
    </>
  );
}
