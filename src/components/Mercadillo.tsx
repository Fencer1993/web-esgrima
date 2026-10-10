"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";

type Option = { id: string; label: string };
export type MercadilloConfig = {
  tipos: Option[];
  estados: Option[];
  manos: Option[];
};

type Item = {
  id: string;
  kind: "vendo" | "busco";
  category: string;
  title: string;
  description: string;
  size: string;
  hand: string;
  condition: string;
  price: number | null;
  zone: string;
  name: string;
  phone: string;
  photos: string[];
  date: string;
};

const inputCls =
  "mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm";
const labelCls = "text-xs font-medium uppercase tracking-wide text-ink-faint";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const MAX_PHOTOS = 3;
const MAX_BYTES = 1.4 * 1024 * 1024;

const base = () => process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function formatPhone(p: string): string {
  const m = /^34([6-9]\d{2})(\d{2})(\d{2})(\d{2})$/.exec(p);
  return m ? `+34 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${p}`;
}

function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

/** Reduce la foto en el navegador: 1200 px el lado largo, JPEG 0,8 (baja la calidad si pesa mucho). */
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const r = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * r));
  canvas.height = Math.max(1, Math.round(bmp.height * r));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  for (const q of [0.8, 0.65, 0.5]) {
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", q));
    if (blob && blob.size <= MAX_BYTES) return blob;
  }
  throw new Error("big");
}

export function Mercadillo({
  config,
  intro,
  aviso,
  clubName,
}: {
  config: MercadilloConfig;
  intro: string;
  aviso: string;
  clubName: string;
}) {
  const uid = useId();
  const [items, setItems] = useState<Item[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<"vendo" | "busco">("vendo");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [hand, setHand] = useState("");

  const tipo = useCallback((id: string) => config.tipos.find((t) => t.id === id)?.label ?? id, [config.tipos]);
  const estado = (id: string) => config.estados.find((t) => t.id === id)?.label ?? "";
  const mano = (id: string) => config.manos.find((t) => t.id === id)?.label ?? "";

  useEffect(() => {
    let alive = true;
    fetch(`${base()}/mercadillo.php?lista`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d?.ok && Array.isArray(d.items)) setItems(d.items as Item[]);
        else setLoadError(true);
      })
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => {
    const q = size.trim().toLowerCase();
    return (items ?? []).filter(
      (i) =>
        i.kind === tab &&
        (!category || i.category === category) &&
        (!q || i.size.toLowerCase().includes(q)) &&
        (!hand || i.hand === hand || i.hand === "indiferente" || i.hand === ""),
    );
  }, [items, tab, category, size, hand]);
  const count = (k: "vendo" | "busco") => (items ?? []).filter((i) => i.kind === k).length;

  return (
    <>
      <p className="max-w-2xl text-base text-ink-soft">{intro}</p>
      <p className="mt-4 max-w-2xl rounded-sm border border-line bg-paper-raised p-4 text-sm text-ink-soft">
        <strong className="text-ink">Importante:</strong> {aviso}
      </p>
      <p className="mt-5">
        <a
          href="#publicar"
          className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-accent-dark"
        >
          Publicar un anuncio ↓
        </a>
      </p>

      <div role="tablist" aria-label="Tipo de anuncio" className="mt-10 flex flex-wrap gap-2">
        {(
          [
            ["vendo", "Se vende"],
            ["busco", "Se busca"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-sm border px-4 py-2 text-sm font-semibold uppercase tracking-wide ${focusRing} ${
              tab === k ? "border-accent bg-accent text-white" : "border-line bg-paper text-ink hover:border-accent"
            }`}
          >
            {label}
            {items ? ` (${count(k)})` : ""}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`${uid}-f-cat`} className={labelCls}>
            Material
          </label>
          <select id={`${uid}-f-cat`} value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            <option value="">Todo</option>
            {config.tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-f-size`} className={labelCls}>
            Talla
          </label>
          <input
            id={`${uid}-f-size`}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Por ejemplo 50 o M"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-f-hand`} className={labelCls}>
            Mano
          </label>
          <select id={`${uid}-f-hand`} value={hand} onChange={(e) => setHand(e.target.value)} className={inputCls}>
            <option value="">Cualquiera</option>
            {config.manos
              .filter((m) => m.id !== "indiferente")
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {loadError ? (
          <p className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            No se pudo cargar el mercadillo. Inténtalo más tarde o escríbenos por WhatsApp.
          </p>
        ) : items === null ? (
          <p className="text-sm text-ink-soft">Cargando anuncios…</p>
        ) : shown.length === 0 ? (
          <p className="text-sm text-ink-soft">
            {count(tab) === 0
              ? tab === "vendo"
                ? "Ahora mismo no hay nada a la venta. ¡Anímate a publicar el primer anuncio!"
                : "Nadie busca material ahora mismo. Si necesitas algo, publica un anuncio en «Se busca»."
              : "Ningún anuncio coincide con esos filtros."}
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((i) => (
              <li key={i.id} className="flex min-w-0 flex-col overflow-hidden rounded-sm border border-line bg-paper">
                {i.photos[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${base()}/${i.photos[0]}`}
                    alt={`Foto de: ${i.title}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">{tipo(i.category)}</p>
                  <h3 className="mt-1 break-words font-display text-lg font-bold uppercase tracking-tight text-ink">
                    {i.title}
                  </h3>
                  <p className="mt-1 text-lg font-bold text-accent-dark">
                    {i.price === null ? "" : i.price === 0 ? "Se regala" : i.kind === "busco" ? `Hasta ${i.price} €` : `${i.price} €`}
                  </p>
                  <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                    {i.size && (
                      <div>
                        <dt className="inline text-ink-faint">Talla: </dt>
                        <dd className="inline">{i.size}</dd>
                      </div>
                    )}
                    {i.hand && mano(i.hand) && (
                      <div>
                        <dt className="inline text-ink-faint">Mano: </dt>
                        <dd className="inline">{mano(i.hand)}</dd>
                      </div>
                    )}
                    {i.condition && (
                      <div>
                        <dt className="inline text-ink-faint">Estado: </dt>
                        <dd className="inline">{estado(i.condition)}</dd>
                      </div>
                    )}
                  </dl>
                  {i.description && <p className="mt-2 whitespace-pre-line break-words text-sm text-ink-soft">{i.description}</p>}
                  <p className="mt-3 text-xs text-ink-faint">
                    {i.zone || "En el club"} · {formatDate(i.date)} · {i.name}
                  </p>
                  <a
                    href={`https://wa.me/${i.phone}?text=${encodeURIComponent(
                      `Hola, te escribo por tu anuncio «${i.title}» del mercadillo del ${clubName}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-4 inline-flex items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-accent-dark ${focusRing}`}
                  >
                    Escribir por WhatsApp
                  </a>
                  <p className="mt-1 text-center text-xs text-ink-faint">{formatPhone(i.phone)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PublishForm config={config} />
    </>
  );
}

function PublishForm({ config }: { config: MercadilloConfig }) {
  const uid = useId();
  const [kind, setKind] = useState<"vendo" | "busco">("vendo");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");
  const [message, setMessage] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);

  const fail = (text: string) => {
    setStatus("error");
    setMessage(text);
    setTimeout(() => errorRef.current?.focus(), 0);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.delete("photos");
    setStatus("sending");
    setMessage("");
    try {
      for (const f of files.slice(0, MAX_PHOTOS)) {
        fd.append("photos[]", await shrink(f), "foto.jpg");
      }
    } catch {
      return fail("No se pudo preparar una de las fotos. Prueba con otra o publica el anuncio sin foto.");
    }
    try {
      const res = await fetch(`${base()}/mercadillo.php`, { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        setStatus("done");
        form.reset();
        setFiles([]);
      } else {
        fail(data?.error ?? "No se pudo enviar el anuncio. Inténtalo de nuevo o escríbenos por WhatsApp.");
      }
    } catch {
      fail("No se pudo enviar el anuncio. Revisa tu conexión o escríbenos por WhatsApp.");
    }
  }

  if (status === "done") {
    return (
      <div id="publicar" className="mt-14 scroll-mt-24 rounded-sm border border-accent bg-paper p-6 sm:p-8" role="status">
        <h3
          ref={doneRef}
          tabIndex={-1}
          className="font-display text-2xl font-bold uppercase tracking-tight text-ink outline-none"
        >
          ¡Anuncio recibido!
        </h3>
        <p className="mt-3 max-w-xl text-sm text-ink-soft">
          El club lo revisará y lo publicará en cuanto pueda. Te hemos enviado un correo con tu enlace privado para
          marcarlo como vendido, renovarlo o borrarlo (mira también en spam).
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className={`mt-5 rounded-sm border border-accent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-accent-dark hover:bg-accent-soft ${focusRing}`}
        >
          Publicar otro anuncio
        </button>
      </div>
    );
  }

  const check = "mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]";
  return (
    <form
      id="publicar"
      onSubmit={onSubmit}
      className="relative mt-14 scroll-mt-24 rounded-sm border border-line bg-paper p-5 sm:p-6"
    >
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">Publicar un anuncio</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Solo material de esgrima. El club revisa cada anuncio antes de publicarlo y estará visible 90 días.
      </p>

      <fieldset className="mt-5">
        <legend className={labelCls}>¿Qué quieres hacer?</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink">
          {(
            [
              ["vendo", "Vendo o regalo material"],
              ["busco", "Busco material"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2">
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="accent-[var(--accent)]" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-cat`} className={labelCls}>
            Tipo de material
          </label>
          <select id={`${uid}-cat`} name="category" required defaultValue="" className={inputCls}>
            <option value="" disabled>
              Elige…
            </option>
            {config.tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-title`} className={labelCls}>
            Título
          </label>
          <input id={`${uid}-title`} name="title" required minLength={3} maxLength={80} placeholder="Careta de sable talla M" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-desc`} className={labelCls}>
            Descripción (opcional, máx. 600 caracteres)
          </label>
          <textarea id={`${uid}-desc`} name="description" rows={4} maxLength={600} className={inputCls} />
        </div>
        <div>
          <label htmlFor={`${uid}-size`} className={labelCls}>
            Talla (opcional)
          </label>
          <input id={`${uid}-size`} name="size" maxLength={30} placeholder="50, M, 38…" className={inputCls} />
        </div>
        <div>
          <label htmlFor={`${uid}-hand`} className={labelCls}>
            Mano (opcional)
          </label>
          <select id={`${uid}-hand`} name="hand" defaultValue="" className={inputCls}>
            <option value="">No aplica</option>
            {config.manos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-cond`} className={labelCls}>
            Estado{kind === "busco" ? " (opcional)" : ""}
          </label>
          <select id={`${uid}-cond`} name="condition" required={kind === "vendo"} defaultValue="" className={inputCls}>
            <option value="" disabled={kind === "vendo"}>
              {kind === "vendo" ? "Elige…" : "Da igual"}
            </option>
            {config.estados.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-price`} className={labelCls}>
            {kind === "vendo" ? "Precio en € (0 = se regala)" : "Presupuesto máximo en € (opcional)"}
          </label>
          <input
            id={`${uid}-price`}
            name="price"
            type="number"
            inputMode="numeric"
            min={0}
            max={5000}
            step={1}
            required={kind === "vendo"}
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-zone`} className={labelCls}>
            Zona (opcional; si lo dejas vacío pondremos «En el club»)
          </label>
          <input id={`${uid}-zone`} name="zone" maxLength={60} placeholder="Torremolinos, Málaga…" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-photos`} className={labelCls}>
            Fotos (opcional, hasta {MAX_PHOTOS}). Solo del material, sin personas.
          </label>
          <input
            id={`${uid}-photos`}
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []);
              if (list.length > MAX_PHOTOS) {
                fail(`Puedes subir como máximo ${MAX_PHOTOS} fotos.`);
                e.target.value = "";
                setFiles([]);
                return;
              }
              setFiles(list);
              if (status === "error") setStatus("idle");
            }}
            className={`${inputCls} file:mr-3 file:rounded-sm file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent-dark`}
          />
          {files.length > 0 && <p className="mt-1 text-xs text-ink-faint">{files.length} foto(s) seleccionada(s); se reducen antes de subirlas.</p>}
        </div>
        <div>
          <label htmlFor={`${uid}-name`} className={labelCls}>
            Tu nombre de pila (se muestra)
          </label>
          <input id={`${uid}-name`} name="name" required maxLength={40} autoComplete="given-name" className={inputCls} />
        </div>
        <div>
          <label htmlFor={`${uid}-phone`} className={labelCls}>
            Tu WhatsApp (se muestra)
          </label>
          <input id={`${uid}-phone`} name="phone" type="tel" required maxLength={30} autoComplete="tel" placeholder="612 34 56 78" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-email`} className={labelCls}>
            Tu correo (no se publica; te enviamos el enlace para gestionar tu anuncio)
          </label>
          <input id={`${uid}-email`} name="email" type="email" required maxLength={150} autoComplete="email" className={inputCls} />
        </div>
      </div>

      {/* Anti-spam: los bots lo rellenan, las personas no lo ven. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No rellenar
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-5 space-y-3 text-sm text-ink-soft">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="adult" required className={check} />
          <span>Soy mayor de edad o lo publica mi padre, madre o tutor.</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="share" required className={check} />
          <span>Acepto que mi nombre de pila y mi WhatsApp se muestren en el anuncio.</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="privacy" required className={check} />
          <span>
            He leído y acepto la{" "}
            <Link href="/politica-de-privacidad" target="_blank" className="font-semibold text-accent-dark underline">
              política de privacidad
            </Link>
            .
          </span>
        </label>
      </div>

      {message && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-4 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 outline-none"
        >
          {message}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className={`rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark disabled:opacity-60 ${focusRing}`}
        >
          {status === "sending" ? "Enviando…" : "Enviar el anuncio"}
        </button>
        <p className="text-xs text-ink-faint">Gratis. Lo revisa el club antes de publicarlo.</p>
      </div>
    </form>
  );
}
