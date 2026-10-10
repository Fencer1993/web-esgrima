"use client";

import { useCallback, useEffect, useState } from "react";
import { isStandalone } from "@/lib/pwaInstall";

type Status =
  | "checking"
  | "unsupported"
  | "ios-install"
  | "off"
  | "on"
  | "blocked"
  | "busy";

const text = {
  es: {
    enable: "Recibir avisos del club en este dispositivo",
    disable: "Avisos activados · Desactivar",
    busy: "Un momento…",
    blocked: "Avisos bloqueados en el navegador. Actívalos en los ajustes del sitio.",
    iosInstall: "En iPhone, instala primero la app: pulsa Compartir y «Añadir a pantalla de inicio».",
    done: "Avisos activados en este dispositivo.",
    undone: "Avisos desactivados.",
    error: "No se han podido activar los avisos. Inténtalo más tarde.",
  },
  en: {
    enable: "Get club notifications on this device",
    disable: "Notifications on · Turn off",
    busy: "One moment…",
    blocked: "Notifications are blocked in your browser. Enable them in the site settings.",
    iosInstall: "On iPhone, install the app first: tap Share, then “Add to Home Screen”.",
    done: "Notifications are on for this device.",
    undone: "Notifications are off.",
    error: "Could not turn on notifications. Please try again later.",
  },
} as const;

const base = () => process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function isIos(): boolean {
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function pushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function keyToBytes(key: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (key.length % 4)) % 4);
  const bin = atob((key + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function readyRegistration(): Promise<ServiceWorkerRegistration | null> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
  ]);
}

/**
 * Activa o desactiva los avisos push del club en este dispositivo (pie de
 * página y /calendario). No pinta nada si el navegador no los admite; en
 * iPhone solo funcionan con la app instalada. El permiso se pide únicamente
 * al pulsar el botón.
 */
export function AvisosToggle({
  lang = "es",
  variant = "dark",
}: {
  lang?: "es" | "en";
  variant?: "dark" | "light";
}) {
  const t = text[lang];
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let next: Status;
      if (isIos() && !isStandalone()) {
        next = "ios-install";
      } else if (!pushSupported()) {
        next = "unsupported";
      } else if (Notification.permission === "denied") {
        next = "blocked";
      } else {
        next = "off";
        try {
          const reg = await readyRegistration();
          const sub = reg ? await reg.pushManager.getSubscription() : null;
          if (sub && Notification.permission === "granted") next = "on";
        } catch {
          // se queda en "off"
        }
      }
      if (!cancelled) setStatus(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(async () => {
    setStatus("busy");
    setMessage("");
    let sub: PushSubscription | null = null;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "blocked" : "off");
        return;
      }
      const reg = await readyRegistration();
      if (!reg) throw new Error("sw");
      const keyRes = await fetch(`${base()}/push-clave.php`, { cache: "no-store" });
      const keyData = await keyRes.json();
      if (!keyData?.ok || typeof keyData.key !== "string") throw new Error("key");
      sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyToBytes(keyData.key),
        }));
      const res = await fetch(`${base()}/push-suscribir.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), lang }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error("server");
      setStatus("on");
      setMessage(t.done);
    } catch {
      try {
        await sub?.unsubscribe();
      } catch {
        // nada que deshacer
      }
      setStatus(Notification.permission === "denied" ? "blocked" : "off");
      setMessage(t.error);
    }
  }, [lang, t.done, t.error]);

  const disable = useCallback(async () => {
    setStatus("busy");
    setMessage("");
    try {
      const reg = await readyRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await fetch(`${base()}/push-suscribir.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "unsubscribe", endpoint }),
        }).catch(() => undefined);
      }
      setStatus("off");
      setMessage(t.undone);
    } catch {
      setStatus("on");
      setMessage(t.error);
    }
  }, [t.undone, t.error]);

  if (status === "checking" || status === "unsupported") return null;

  const hintClass =
    variant === "dark" ? "text-paper/75" : "text-ink-soft";
  const buttonClass =
    variant === "dark"
      ? "border-white/15 text-paper hover:border-accent hover:text-white focus-visible:outline-white"
      : "border-line text-ink hover:border-accent focus-visible:outline-accent";

  if (status === "ios-install") {
    return (
      <p className={`mt-3 max-w-xs text-xs leading-relaxed ${hintClass}`}>{t.iosInstall}</p>
    );
  }

  const on = status === "on";
  return (
    <div className="mt-3">
      {status === "blocked" ? (
        <p className={`max-w-xs text-xs leading-relaxed ${hintClass}`}>{t.blocked}</p>
      ) : (
        <button
          type="button"
          aria-pressed={on}
          disabled={status === "busy"}
          onClick={() => (on ? disable() : enable())}
          className={`group inline-flex items-center gap-3 rounded-sm border px-4 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${buttonClass}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-accent"
          >
            <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
            <path d="M10 19a2 2 0 0 0 4 0" />
            {on && <path d="m9 9.5 2 2 4-4" />}
          </svg>
          {status === "busy" ? t.busy : on ? t.disable : t.enable}
        </button>
      )}
      <p role="status" aria-live="polite" className={`mt-2 max-w-xs text-xs leading-relaxed ${hintClass}`}>
        {message}
      </p>
    </div>
  );
}
