// Estado compartido de "instalar la app" entre PwaRegister (banner) y
// InstallAppLink (pie de página). Solo se usa en el navegador.

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// "prompt": Chrome/Android ofrece instalar; "ios": Safari de iPhone/iPad
// (hay que explicar Compartir → Añadir a pantalla de inicio); "none": nada
// que ofrecer (ya instalada, navegador sin soporte, o todavía no se sabe).
export type InstallMode = "prompt" | "ios" | "none";

export const DISMISS_KEY = "esgrima-pwa-install-dismissed";

let deferred: BeforeInstallPromptEvent | null = null;
let started = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function isStandalone(): boolean {
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const ios =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // Otros navegadores de iOS (Chrome, Firefox, Edge, Opera) llevan su sello.
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    emit();
  });
}

export function subscribeInstall(cb: () => void) {
  start();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getInstallMode(): InstallMode {
  if (isStandalone()) return "none";
  if (deferred) return "prompt";
  if (isIosSafari()) return "ios";
  return "none";
}

export const getServerInstallMode = (): InstallMode => "none";

/** Lanza el diálogo nativo de instalación (solo modo "prompt"). */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const ev = deferred;
  deferred = null; // el evento solo se puede usar una vez
  emit();
  try {
    await ev.prompt();
    return (await ev.userChoice).outcome === "accepted";
  } catch {
    return false;
  }
}

export function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* sin almacenamiento: se volverá a mostrar, no pasa nada */
  }
}

// Escuchar cuanto antes: beforeinstallprompt puede llegar antes de hidratar.
start();
