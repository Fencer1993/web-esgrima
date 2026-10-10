"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Ad = {
  title: string;
  kind: "vendo" | "busco";
  status: string;
  expired: boolean;
  days_left: number | null;
  can_renew: boolean;
  reject_reason: string;
};

const btn =
  "rounded-sm px-4 py-2.5 text-sm font-semibold uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60";

export function MiAnuncio() {
  const [token, setToken] = useState<string | null>(null);
  const [ad, setAd] = useState<Ad | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [gone, setGone] = useState(false);

  async function call(accion: string, t: string) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const res = await fetch(`${base}/mercadillo.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion, token: t }),
    });
    return (await res.json().catch(() => null)) as { ok?: boolean; error?: string; ad?: Ad; status?: string } | null;
  }

  useEffect(() => {
    const t = window.location.hash.replace(/^#/, "");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(t);
    if (!/^[a-f0-9]{48}$/.test(t)) {
      setError("Este enlace no es válido. Usa el enlace completo del correo que te enviamos al publicar.");
      return;
    }
    call("ver", t)
      .then((d) => (d?.ok && d.ad ? setAd(d.ad) : setError(d?.error ?? "No se pudo cargar el anuncio.")))
      .catch(() => setError("No se pudo cargar el anuncio. Inténtalo de nuevo."));
  }, []);

  async function act(accion: "vendido" | "renovar" | "borrar") {
    if (!token || busy) return;
    if (accion === "borrar" && !window.confirm("¿Borrar el anuncio y sus fotos? No se puede deshacer.")) return;
    setBusy(true);
    setNote("");
    try {
      const d = await call(accion, token);
      if (!d?.ok) {
        setNote(d?.error ?? "No se pudo completar la acción.");
      } else if (accion === "borrar") {
        setGone(true);
      } else {
        const v = await call("ver", token);
        if (v?.ok && v.ad) setAd(v.ad);
        setNote(accion === "renovar" ? "¡Anuncio renovado 30 días más!" : "Anuncio marcado. ¡Gracias por avisar!");
      }
    } catch {
      setNote("No se pudo completar la acción. Inténtalo de nuevo.");
    }
    setBusy(false);
  }

  if (gone) {
    return <p role="status" className="rounded-sm border border-accent bg-paper p-5 text-sm text-ink">Anuncio borrado. Tus datos y fotos ya no están en el mercadillo.</p>;
  }
  if (error) {
    return <p role="alert" className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
  }
  if (!ad) return <p className="text-sm text-ink-soft">Cargando…</p>;

  const wantWord = ad.kind === "vendo" ? "vendido" : "encontrado";
  const state = ad.expired
    ? "Caducado: ya no se ve en el mercadillo."
    : ad.status === "pendiente"
      ? "Pendiente: el club lo está revisando."
      : ad.status === "aprobado"
        ? `Publicado${ad.days_left !== null ? ` · caduca en ${Math.max(0, ad.days_left)} días` : ""}.`
        : ad.status === "vendido"
          ? `Marcado como ${wantWord}.`
          : `No publicado${ad.reject_reason ? `: ${ad.reject_reason}` : "."}`;

  return (
    <div className="max-w-xl rounded-sm border border-line bg-paper p-5 sm:p-6">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">{ad.kind === "vendo" ? "Se vende" : "Se busca"}</p>
      <h2 className="mt-1 break-words font-display text-2xl font-bold uppercase tracking-tight text-ink">{ad.title}</h2>
      <p className="mt-2 text-sm text-ink-soft" role="status">{state}</p>
      {note && <p className="mt-3 rounded-sm bg-accent-soft px-3 py-2 text-sm text-ink" role="status">{note}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        {(ad.status === "aprobado" || ad.status === "pendiente") && !ad.expired && (
          <button type="button" disabled={busy} onClick={() => act("vendido")} className={`${btn} bg-accent text-white hover:bg-accent-dark`}>
            Marcar como {wantWord}
          </button>
        )}
        {(ad.can_renew || ad.expired) && ad.status === "aprobado" && (
          <button type="button" disabled={busy} onClick={() => act("renovar")} className={`${btn} border border-accent text-accent-dark hover:bg-accent-soft`}>
            Renovar 30 días
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => act("borrar")} className={`${btn} border border-line text-ink hover:border-red-400`}>
          Borrar el anuncio
        </button>
      </div>
      <p className="mt-5 text-xs text-ink-faint">
        Guarda este enlace: es solo tuyo. <Link href="/mercadillo" className="underline">Volver al mercadillo</Link>
      </p>
    </div>
  );
}
